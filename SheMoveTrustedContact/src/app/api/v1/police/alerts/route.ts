import { NextRequest, NextResponse } from 'next/server';
import { policeStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stationId = searchParams.get('station_id') || undefined;
  const status = searchParams.get('status') || undefined;
  const severity = searchParams.get('severity') || undefined;

  const alerts = policeStore.getAlerts(stationId, status, severity);

  return NextResponse.json({
    success: true,
    alerts,
  });
}
