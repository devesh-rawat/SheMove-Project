import { NextRequest, NextResponse } from 'next/server';
import { forwardToBackend } from '@/lib/backend';
import { policeStore } from '@/lib/store';

export async function POST(req: NextRequest) {
  const backendRes = await forwardToBackend(req, '/api/v1/demo/seed');
  if (backendRes) return backendRes;

  policeStore.seed();

  return NextResponse.json({
    success: true,
    message: 'Stations, polygons, police operators, and sample trips seeded successfully',
    stations_count: policeStore.getStations().length,
    trips_count: policeStore.getTrips().length,
  });
}
