import { NextRequest, NextResponse } from 'next/server';
import { forwardToBackend } from '@/lib/backend';
import { policeStore } from '@/lib/store';

export async function POST(req: NextRequest) {
  const backendRes = await forwardToBackend(req, '/api/v1/demo/simulate');
  if (backendRes) return backendRes;

  try {
    const body = await req.json();

    const { action, tripId } = body;

    switch (action) {
      case 'sos': {
        const alert = policeStore.simulateSOS(tripId);
        return NextResponse.json({ success: true, action: 'sos', alert });
      }
      case 'missed_checkin': {
        const alert = policeStore.simulateMissedCheckin(tripId);
        return NextResponse.json({ success: true, action: 'missed_checkin', alert });
      }
      case 'kill_heartbeat': {
        if (!tripId) {
          const trips = policeStore.getTrips();
          const active = trips.find((t) => t.status === 'ACTIVE');
          const target = active ? active.id : trips[0].id;
          const alert = policeStore.simulateKillHeartbeat(target);
          return NextResponse.json({ success: true, action: 'kill_heartbeat', alert });
        }
        const alert = policeStore.simulateKillHeartbeat(tripId);
        return NextResponse.json({ success: true, action: 'kill_heartbeat', alert });
      }
      case 'safe_checkin': {
        const trips = policeStore.getTrips();
        const active = trips.find((t) => t.status === 'ACTIVE' || t.status === 'CHECKIN_PENDING');
        const target = tripId || (active ? active.id : trips[0].id);
        const ok = policeStore.simulateSafeCheckin(target);
        return NextResponse.json({ success: ok, action: 'safe_checkin', tripId: target });
      }
      case 'advance_location': {
        const trips = policeStore.getTrips();
        const active = trips.find((t) => t.status === 'ACTIVE' || t.status === 'ALERT_RAISED');
        const target = tripId || (active ? active.id : trips[0].id);
        const ok = policeStore.simulateAdvanceLocation(target);
        return NextResponse.json({ success: ok, action: 'advance_location', tripId: target });
      }
      case 'complete_trip': {
        const trips = policeStore.getTrips();
        const active = trips.find((t) => t.status === 'ACTIVE' || t.status === 'ALERT_RAISED');
        const target = tripId || (active ? active.id : trips[0].id);
        const ok = policeStore.simulateCompleteTrip(target);
        return NextResponse.json({ success: ok, action: 'complete_trip', tripId: target });
      }
      case 'seed': {
        policeStore.seed();
        return NextResponse.json({ success: true, action: 'seed', message: 'Demo data re-seeded' });
      }
      default:
        return NextResponse.json({ error: `Unknown simulation action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Failed to execute simulation' }, { status: 400 });
  }
}
