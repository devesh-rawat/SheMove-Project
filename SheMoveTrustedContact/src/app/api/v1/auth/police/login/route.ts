import { NextRequest, NextResponse } from 'next/server';
import { forwardToBackend } from '@/lib/backend';
import { DEMO_OFFICERS } from '@/lib/store';

export async function POST(req: NextRequest) {
  const backendRes = await forwardToBackend(req, '/api/v1/auth/police/login');
  if (backendRes) return backendRes;

  try {
    const body = await req.json();

    const { email, password, officerId } = body;

    // Direct officer pick or standard demo credentials
    let officer = DEMO_OFFICERS.find((o) => o.id === officerId);

    if (!officer) {
      if (email === 'police@demo.in' && (password === 'demo1234' || password === '123456')) {
        officer = DEMO_OFFICERS[0];
      } else if (email?.includes('radhika')) {
        officer = DEMO_OFFICERS[1];
      } else if (email?.includes('admin') || email?.includes('hq')) {
        officer = DEMO_OFFICERS[2];
      } else {
        // Fallback to default demo officer if any credentials supplied for demo ease
        officer = DEMO_OFFICERS[0];
      }
    }

    const token = `jwt_police_${officer.id}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      token,
      officer,
      expires_in: 86400,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid login request' }, { status: 400 });
  }
}
