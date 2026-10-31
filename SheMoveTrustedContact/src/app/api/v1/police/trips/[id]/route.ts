import { NextRequest, NextResponse } from 'next/server';
import { policeStore } from '@/lib/store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const trip = policeStore.getTripById(id);

  if (!trip) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    trip,
  });
}
