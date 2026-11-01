import { NextRequest, NextResponse } from 'next/server';
import { forwardToBackend } from '@/lib/backend';
import { policeStore } from '@/lib/store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const backendRes = await forwardToBackend(req, `/api/v1/police/alerts/${id}/ack`);
  if (backendRes) return backendRes;

  let officerName = 'Police Operator';


  try {
    const body = await req.json();
    if (body.officerName) officerName = body.officerName;
  } catch {
    // Body is optional
  }

  const ok = policeStore.acknowledgeAlert(id, officerName);
  if (!ok) {
    return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: 'Alert acknowledged',
    acknowledged_at: new Date().toISOString(),
  });
}
