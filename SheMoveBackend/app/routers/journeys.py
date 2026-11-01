from fastapi import APIRouter, Depends, HTTPException

from app.auth import require_traveller
from app.risk import assess_journey
from app.schemas import CheckinIn, CompleteIn, DisarmIn, ExtendIn, HeartbeatIn, JourneyStart, OfflineSyncIn, SosIn, VehicleIn
from app.store import sanitize_trip, store

router = APIRouter(prefix="/api/v1/journeys", tags=["journeys"])


def _owned(trip_id: str, user_id: str) -> dict:
    trip = store.get_trip(trip_id)
    if not trip or trip.get("traveller_id") != user_id:
        raise HTTPException(status_code=404, detail="Journey not found")
    return trip


@router.post("")
def start_journey(body: JourneyStart, principal: dict = Depends(require_traveller)):
    user = store.get_user(principal["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        trip = store.start_journey(user, body.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return {"success": True, "trip": trip, "share": sanitize_trip(trip)}


@router.get("")
def list_journeys(principal: dict = Depends(require_traveller)):
    return {"success": True, "trips": store.list_user_trips(principal["sub"])}


@router.get("/active")
def active_journey(principal: dict = Depends(require_traveller)):
    trip = store.active_trip_for_user(principal["sub"])
    return {"success": True, "trip": trip}


@router.get("/{trip_id}")
def get_journey(trip_id: str, principal: dict = Depends(require_traveller)):
    return {"success": True, "trip": _owned(trip_id, principal["sub"])}


@router.get("/{trip_id}/risk")
def journey_risk(trip_id: str, principal: dict = Depends(require_traveller)):
    trip = _owned(trip_id, principal["sub"])
    return {"success": True, "risk": assess_journey(trip)}


@router.post("/{trip_id}/heartbeat")
def heartbeat(trip_id: str, body: HeartbeatIn, principal: dict = Depends(require_traveller)):
    _owned(trip_id, principal["sub"])
    trip = store.record_heartbeat(trip_id, body.model_dump())
    return {"success": True, "trip": trip, "risk": assess_journey(trip)}


@router.post("/{trip_id}/location")
def location(trip_id: str, body: HeartbeatIn, principal: dict = Depends(require_traveller)):
    return heartbeat(trip_id, body, principal)


@router.post("/{trip_id}/vehicle")
def vehicle(trip_id: str, body: VehicleIn, principal: dict = Depends(require_traveller)):
    _owned(trip_id, principal["sub"])
    extra = body.model_dump(exclude={"vehicle_number"})
    trip = store.set_vehicle(trip_id, body.vehicle_number, extra)
    return {"success": True, "trip": trip}


@router.post("/{trip_id}/extend")
def extend(trip_id: str, body: ExtendIn, principal: dict = Depends(require_traveller)):
    trip = _owned(trip_id, principal["sub"])
    if body.pin:
        pin = store.verify_pin(principal["sub"], body.pin)
        if not pin["valid"]:
            raise HTTPException(status_code=400, detail="Invalid PIN entered. Please try again.")
        if pin["duress"]:
            store.trigger_duress_alert(trip_id)
            return {
                "success": True,
                "duressTriggered": True,
                "message": f"Trip duration extended by {body.additional_minutes} minutes.",
                "newDurationMinutes": round(trip["expected_duration_s"] / 60) + body.additional_minutes,
            }
    updated = store.extend_trip(trip_id, body.additional_minutes)
    return {
        "success": True,
        "duressTriggered": False,
        "trip": updated,
        "ends_at": updated["ends_at"],
        "newDurationMinutes": round(updated["expected_duration_s"] / 60),
    }


@router.post("/{trip_id}/checkin/due")
def checkin_due(trip_id: str, principal: dict = Depends(require_traveller)):
    _owned(trip_id, principal["sub"])
    checkin = store.schedule_checkin(trip_id)
    return {"success": True, "checkin": checkin, "trip": store.get_trip(trip_id)}


@router.post("/{trip_id}/checkin")
def checkin(trip_id: str, body: CheckinIn, principal: dict = Depends(require_traveller)):
    _owned(trip_id, principal["sub"])
    duress = False
    if body.pin:
        pin = store.verify_pin(principal["sub"], body.pin)
        if not pin["valid"] and not body.biometric:
            raise HTTPException(status_code=400, detail="Invalid PIN")
        duress = pin.get("duress", False)
        if duress:
            store.respond_to_checkin(trip_id, "SAFE", duress=True)
            return {
                "success": True,
                "response": "SAFE",
                "duressTriggered": True,
                "message": "Safety confirmed",
                "trip": store.get_trip(trip_id),
            }
    store.respond_to_checkin(trip_id, body.response, duress=False)
    return {"success": True, "response": body.response, "duressTriggered": False, "trip": store.get_trip(trip_id)}


@router.post("/{trip_id}/sos")
def sos(trip_id: str, body: SosIn, principal: dict = Depends(require_traveller)):
    user_id = principal["sub"]
    trip = store.get_trip(trip_id)
    if not trip or trip.get("traveller_id") != user_id:
        trip = store.active_trip_for_user(user_id)
    if not trip:
        user = store.get_user(user_id)
        if user:
            trip = store.start_journey(user, {
                "start_name": body.address or "Emergency Location",
                "destination_name": "Emergency Services",
                "lat": body.lat or 28.6139,
                "lng": body.lng or 77.2090,
                "accuracy_m": body.accuracy_m or 8,
                "battery_pct": body.battery_pct or 80,
                "transport_mode": "walking",
                "estimated_minutes": 30,
                "checkin_interval_minutes": 5,
            })
    if not trip:
        raise HTTPException(status_code=404, detail="Journey not found")

    if body.pin:
        pin = store.verify_pin(principal["sub"], body.pin)
        if pin.get("duress"):
            alert = store.trigger_duress_alert(
                trip["id"],
                lat=body.lat,
                lng=body.lng,
                accuracy_m=body.accuracy_m,
                battery_pct=body.battery_pct,
                address=body.address,
            )
            return {"success": True, "alert": alert, "disguise": True, "trip": store.get_trip(trip["id"])}
        if not pin["valid"]:
            raise HTTPException(status_code=400, detail="Invalid PIN")
    alert = store.trigger_sos(
        trip["id"],
        body.reason,
        lat=body.lat,
        lng=body.lng,
        accuracy_m=body.accuracy_m,
        battery_pct=body.battery_pct,
        address=body.address,
    )
    return {"success": True, "alert": alert, "trip": store.get_trip(trip["id"])}


@router.post("/{trip_id}/disarm")
def disarm(trip_id: str, body: DisarmIn, principal: dict = Depends(require_traveller)):
    user_id = principal["sub"]
    trip = store.get_trip(trip_id) or store.active_trip_for_user(user_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Journey not found")

    pin_res = store.verify_pin(user_id, body.pin)
    if not pin_res["valid"]:
        raise HTTPException(status_code=400, detail="Invalid Security PIN")

    if pin_res.get("duress"):
        alert = store.trigger_duress_alert(trip["id"])
        return {
            "success": True,
            "disarm": False,
            "duress": True,
            "message": "Alert disarmed",
            "trip": store.get_trip(trip["id"]),
        }

    updated = store.disarm_trip(trip["id"], actor=user_id)
    return {
        "success": True,
        "disarm": True,
        "duress": False,
        "message": "Emergency successfully disarmed with Safety PIN",
        "trip": updated,
    }


@router.post("/{trip_id}/complete")
def complete(trip_id: str, body: CompleteIn, principal: dict = Depends(require_traveller)):
    _owned(trip_id, principal["sub"])
    trip = store.complete_trip(trip_id, body.confirmed_safe)
    return {"success": True, "trip": trip}


@router.post("/{trip_id}/cancel")
def cancel(trip_id: str, principal: dict = Depends(require_traveller)):
    _owned(trip_id, principal["sub"])
    trip = store.cancel_trip(trip_id)
    return {"success": True, "trip": trip}


@router.post("/{trip_id}/offline-sync")
def offline_sync(trip_id: str, body: OfflineSyncIn, principal: dict = Depends(require_traveller)):
    _owned(trip_id, principal["sub"])
    trip = store.sync_offline_events(trip_id, body.events)
    return {"success": True, "trip": trip}
