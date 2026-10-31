import { NextRequest, NextResponse } from 'next/server';
import { policeStore } from '@/lib/store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let notes = 'Resolved by operator';
  let outcome = 'RESOLVED_SAFE';
  let officerName = 'Police Operator';

  try {
    const body = await req.json();
    if (body.notes) notes = body.notes;
    if (body.outcome) outcome = body.outcome;
    if (body.officerName) officerName = body.officerName;
  } catch {
    // defaults
  }

  const ok = policeStore.resolveAlert(id, officerName, notes, outcome);
  if (!ok) {
    return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: 'Alert resolved',
    resolved_at: new Date().toISOString(),
  });
}
