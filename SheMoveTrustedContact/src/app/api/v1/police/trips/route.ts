import { NextRequest, NextResponse } from 'next/server';
import { forwardToBackend } from '@/lib/backend';
import { policeStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  const { search } = new URL(req.url);
  const backendRes = await forwardToBackend(req, `/api/v1/police/trips${search}`);
  if (backendRes) return backendRes;

  const { searchParams } = new URL(req.url);
  const stationId = searchParams.get('station_id') || undefined;
  const status = searchParams.get('status') || undefined;

  const trips = policeStore.getTrips(stationId, status);
  const stats = policeStore.getStats(stationId);

  return NextResponse.json({
    success: true,
    trips,
    stats,
  });
}

