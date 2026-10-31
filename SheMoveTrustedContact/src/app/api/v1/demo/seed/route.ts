import { NextResponse } from 'next/server';
import { policeStore } from '@/lib/store';

export async function POST() {
  policeStore.seed();
  return NextResponse.json({
    success: true,
    message: 'Stations, polygons, police operators, and sample trips seeded successfully',
    stations_count: policeStore.getStations().length,
    trips_count: policeStore.getTrips().length,
  });
}
