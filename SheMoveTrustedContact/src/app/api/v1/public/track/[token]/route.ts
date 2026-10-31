import { NextRequest, NextResponse } from 'next/server';
import { policeStore } from '@/lib/store';

// Default PIN settings
const REAL_PIN = '1234';
const DURESS_PIN = '9999';

function sanitizeTrip(trip: any) {
  return {
    id: trip.id,
    share_token: trip.share_token,
    traveller_name: trip.traveller_name,
    traveller_first_name: trip.traveller_name.split(' ')[0],
    traveller_full_name: trip.traveller_name,
    traveller_phone: trip.traveller_phone,
    traveller_phone_masked: trip.traveller_phone.replace(/(\+\d{2}\s\d{2})\d{4}(\d{4})/, '$1****$2'),
    status: trip.status,
    started_at: trip.started_at,
    expected_duration_s: trip.expected_duration_s,
    ends_at: trip.ends_at,
    destination_name: trip.destination_name || 'Destination',
    destination: trip.destination,
    completed_at: trip.completed_at,
    vehicle_number: trip.vehicle_number || null,
    vehicle_entered_at: trip.vehicle_entered_at,
    next_checkin_due_at: trip.next_checkin_due_at,
    checkin_deadline_at: trip.checkin_deadline_at,
    last_heartbeat_at: trip.last_heartbeat_at,
    last_location: trip.last_location,
    last_accuracy_m: trip.last_accuracy_m,
    last_battery_pct: trip.last_battery_pct,
    current_station_name: trip.current_station_name,
    location_history: trip.location_history.slice(-30),
    checkins: trip.checkins.slice(0, 5),
    alerts: trip.alerts,
    active_alert: trip.alerts.find((a: any) => a.status === 'OPEN' || a.status === 'ACKNOWLEDGED') || null,
    contacts: trip.contacts || [],
    contacts_count: (trip.contacts || []).length,
    dispatch_info: trip.dispatchInfo || null,
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const trip = policeStore.getTripByToken(token);

  if (!trip) {
    return NextResponse.json(
      { error: 'Tracking link expired or not found', code: 'TRIP_NOT_FOUND' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    trip: sanitizeTrip(trip),
    server_time: new Date().toISOString(),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();
    const { action } = body;

    const trip = policeStore.getTripByToken(token);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    switch (action) {
      case 'modify_time': {
        const { pin, additionalMinutes = 15 } = body;

        // Check if duress / fake PIN was entered
        if (pin === DURESS_PIN) {
          // Coercion defense: Trigger silent CRITICAL alert while returning successful disguise response
          policeStore.triggerDuressAlert(trip.id);
          return NextResponse.json({
            success: true,
            duressTriggered: true,
            message: `Trip duration extended by ${additionalMinutes} minutes.`,
            newDurationMinutes: Math.round(trip.expected_duration_s / 60) + additionalMinutes,
          });
        }

        if (pin === REAL_PIN || !pin) {
          const res = policeStore.modifyTripDuration(trip.id, additionalMinutes);
          return NextResponse.json({
            success: true,
            duressTriggered: false,
            message: `Trip duration extended by ${additionalMinutes} minutes.`,
            newDurationMinutes: Math.round((res.trip?.expected_duration_s || trip.expected_duration_s) / 60),
            ends_at: res.trip?.ends_at,
          });
        }

        return NextResponse.json(
          { error: 'Invalid PIN entered. Please try again.', code: 'INVALID_PIN' },
          { status: 400 }
        );
      }

      case 'checkin_response': {
        const { response } = body; // 'SAFE' | 'UNSAFE'
        if (response !== 'SAFE' && response !== 'UNSAFE') {
          return NextResponse.json({ error: 'Invalid response value' }, { status: 400 });
        }
        policeStore.respondToCheckin(trip.id, response);
        const updated = policeStore.getTripById(trip.id) || trip;
        return NextResponse.json({ success: true, response, trip: sanitizeTrip(updated) });
      }

      case 'sos': {
        const alert = policeStore.simulateSOS(trip.id);
        const updated = policeStore.getTripById(trip.id) || trip;
        return NextResponse.json({ success: true, alert, trip: sanitizeTrip(updated) });
      }

      case 'simulate': {
        const { subAction, mode } = body;
        if (subAction === 'set_mode') {
          policeStore.setTripScenario(trip.id, mode);
        } else if (subAction === 'advance_location') {
          policeStore.simulateAdvanceLocation(trip.id);
        } else if (subAction === 'kill_heartbeat') {
          policeStore.setTripScenario(trip.id, 'silent');
        } else if (subAction === 'safe_checkin') {
          policeStore.setTripScenario(trip.id, 'live');
        } else if (subAction === 'complete_trip') {
          policeStore.setTripScenario(trip.id, 'done');
        } else if (subAction === 'reset') {
          policeStore.seed();
        }
        const updated = policeStore.getTripById(trip.id) || trip;
        return NextResponse.json({ success: true, subAction, trip: sanitizeTrip(updated) });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    console.error('Error in POST /api/v1/public/track:', err);
    return NextResponse.json({ error: 'Internal server error processing request', details: String(err) }, { status: 500 });
  }
}
