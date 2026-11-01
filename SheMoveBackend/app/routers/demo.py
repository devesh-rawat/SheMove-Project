from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.schemas import SimulateIn, TestSmsIn
from app.store import store
from app.twilio_service import send_sms, send_whatsapp

router = APIRouter(prefix="/api/v1/demo", tags=["demo"])


@router.post("/seed")
def seed():
    store.seed()
    return {
        "success": True,
        "message": "Stations, polygons, police operators, and sample trips seeded successfully",
        "stations_count": len(store.get_stations()),
        "trips_count": len(store.get_trips()),
    }


@router.post("/simulate")
def simulate(body: SimulateIn):
    action = body.action
    trip_id = body.tripId
    trips = store.get_trips()

    if action == "sos":
        alert = store.simulate_sos(trip_id)
        return {"success": True, "action": "sos", "alert": alert}
    if action == "live":
        active = next((t for t in trips if t.get("status") in {"ACTIVE", "CHECKIN_PENDING", "ALERT_RAISED"}), trips[0] if trips else None)
        target = trip_id or (active["id"] if active else None)
        ok = store.set_trip_scenario(target, "live") if target else False
        return {"success": ok, "action": "live", "tripId": target}
    if action == "trigger_checkin":
        active = next((t for t in trips if t.get("status") in {"ACTIVE", "CHECKIN_PENDING"}), trips[0] if trips else None)
        target = trip_id or (active["id"] if active else None)
        chk = store.schedule_checkin(target) if target else None
        return {"success": bool(chk), "action": "trigger_checkin", "checkin": chk}
    if action == "route_deviation":
        active = next((t for t in trips if t.get("status") in {"ACTIVE", "CHECKIN_PENDING"}), trips[0] if trips else None)
        target = trip_id or (active["id"] if active else None)
        alert = store.simulate_route_deviation(target) if target else None
        return {"success": bool(alert), "action": "route_deviation", "alert": alert}
    if action == "missed_checkin":
        alert = store.simulate_missed_checkin(trip_id)
        return {"success": True, "action": "missed_checkin", "alert": alert}
    if action == "kill_heartbeat":
        if not trip_id:
            active = next((t for t in trips if t.get("status") == "ACTIVE"), trips[0] if trips else None)
            trip_id = active["id"] if active else None
        if not trip_id:
            raise HTTPException(status_code=404, detail="No trip available")
        alert = store.simulate_kill_heartbeat(trip_id)
        return {"success": True, "action": "kill_heartbeat", "alert": alert}
    if action == "safe_checkin":
        active = next((t for t in trips if t.get("status") in {"ACTIVE", "CHECKIN_PENDING"}), trips[0] if trips else None)
        target = trip_id or (active["id"] if active else None)
        ok = store.simulate_safe_checkin(target) if target else False
        return {"success": ok, "action": "safe_checkin", "tripId": target}
    if action == "advance_location":
        active = next((t for t in trips if t.get("status") in {"ACTIVE", "ALERT_RAISED"}), trips[0] if trips else None)
        target = trip_id or (active["id"] if active else None)
        ok = store.simulate_advance_location(target) if target else False
        return {"success": ok, "action": "advance_location", "tripId": target}
    if action == "complete_trip":
        active = next((t for t in trips if t.get("status") in {"ACTIVE", "ALERT_RAISED"}), trips[0] if trips else None)
        target = trip_id or (active["id"] if active else None)
        ok = bool(store.simulate_complete_trip(target) if target else False)
        return {"success": ok, "action": "complete_trip", "tripId": target}
    if action == "seed":
        store.seed()
        return {"success": True, "action": "seed", "message": "Demo data re-seeded"}
    raise HTTPException(status_code=400, detail=f"Unknown simulation action: {action}")


@router.get("/twilio-status")
def twilio_status():
    settings = get_settings()
    return {
        "success": True,
        "twilio_enabled": settings.twilio_enabled,
        "account_sid_configured": bool(settings.twilio_account_sid),
        "from_number_configured": bool(settings.twilio_from_number),
        "from_number": settings.twilio_from_number or "",
        "whatsapp_enabled": settings.twilio_whatsapp_enabled,
    }


@router.post("/test-sms")
def test_sms(body: TestSmsIn):
    settings = get_settings()
    if not settings.twilio_enabled:
        return {
            "success": False,
            "error": "TWILIO_ENABLED is currently set to false in .env. Please configure your Twilio Account SID, Auth Token, and phone number, then set TWILIO_ENABLED=true.",
            "twilio_enabled": False,
        }
    if not settings.twilio_account_sid or not settings.twilio_auth_token:
        return {
            "success": False,
            "error": "TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN is missing in .env.",
        }
    if not settings.twilio_from_number:
        return {
            "success": False,
            "error": "TWILIO_FROM_NUMBER is missing in .env.",
        }

    msg = body.message or "🚨 SheMove Test SMS: Twilio integration verified successfully!"
    ok = send_sms(body.to_phone, msg)
    if not ok:
        raise HTTPException(
            status_code=500,
            detail="Failed to dispatch SMS via Twilio. Check Twilio logs and phone number format (E.164, e.g. +91XXXXXXXXXX).",
        )
    return {
        "success": True,
        "recipient": body.to_phone,
        "message": msg,
        "from_number": settings.twilio_from_number,
    }


@router.post("/test-whatsapp")
def test_whatsapp(body: TestSmsIn):
    settings = get_settings()
    if not settings.twilio_enabled or not settings.twilio_whatsapp_enabled:
        return {
            "success": False,
            "error": "TWILIO_WHATSAPP_ENABLED is set to false in .env.",
        }
    msg = body.message or "🚨 SheMove WhatsApp Alert Test: Real-time emergency beacon connected!"
    ok = send_whatsapp(body.to_phone, msg)
    if not ok:
        raise HTTPException(
            status_code=500,
            detail="Failed to dispatch WhatsApp message. Ensure your TWILIO_WHATSAPP_CONTENT_SID is set or recipient has messaged the sandbox.",
        )
    return {
        "success": True,
        "recipient": body.to_phone,
        "message": msg,
        "from_number": settings.twilio_whatsapp_from_number or settings.twilio_from_number,
    }


