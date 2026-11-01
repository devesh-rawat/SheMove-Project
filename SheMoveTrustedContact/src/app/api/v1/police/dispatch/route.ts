import { NextRequest, NextResponse } from 'next/server';
import { forwardToBackend } from '@/lib/backend';
import { policeStore } from '@/lib/store';

export async function POST(req: NextRequest) {
  const backendRes = await forwardToBackend(req, '/api/v1/police/dispatch');
  if (backendRes) return backendRes;

  try {
    const body = await req.json();

    const { tripId, unitCallsign, officerInCharge, etaMinutes, notes } = body;

    if (!tripId) {
      return NextResponse.json({ error: 'Missing tripId' }, { status: 400 });
    }

    const ok = policeStore.dispatchEmergencyUnit(
      tripId,
      unitCallsign || 'PCR-ECHO-14',
      officerInCharge || 'Sub-Inspector Kumar',
      etaMinutes || 4,
      notes || 'Dispatched for emergency interception.'
    );

    if (!ok) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: '112 Emergency Patrol unit dispatched successfully',
      dispatch: {
        unitCallsign: unitCallsign || 'PCR-ECHO-14',
        officerInCharge: officerInCharge || 'Sub-Inspector Kumar',
        etaMinutes: etaMinutes || 4,
        dispatched_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid dispatch request' }, { status: 400 });
  }
}
