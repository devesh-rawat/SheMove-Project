import { NextRequest, NextResponse } from 'next/server';
import { forwardToBackend } from '@/lib/backend';
import { policeStore } from '@/lib/store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const backendRes = await forwardToBackend(req, `/api/v1/police/trips/${id}`);
  if (backendRes) return backendRes;

  const trip = policeStore.getTripById(id);


  if (!trip) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    trip,
  });
}
