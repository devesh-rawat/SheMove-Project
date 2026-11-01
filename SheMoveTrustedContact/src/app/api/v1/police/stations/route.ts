import { NextRequest, NextResponse } from 'next/server';
import { forwardToBackend } from '@/lib/backend';
import { policeStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  const backendRes = await forwardToBackend(req, '/api/v1/police/stations');
  if (backendRes) return backendRes;

  const stations = policeStore.getStations();
  return NextResponse.json({
    success: true,
    stations,
  });
}

