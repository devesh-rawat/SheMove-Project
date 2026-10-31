import { NextResponse } from 'next/server';
import { policeStore } from '@/lib/store';

export async function GET() {
  const stations = policeStore.getStations();
  return NextResponse.json({
    success: true,
    stations,
  });
}
