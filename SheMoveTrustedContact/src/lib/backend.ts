import { NextRequest, NextResponse } from 'next/server';

export const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://127.0.0.1:8000';

/**
 * Proxy an incoming Next.js request to the SheMove FastAPI backend.
 * Returns a NextResponse with the backend data if available, or null on network/timeout failure.
 */
export async function forwardToBackend(
  req: NextRequest,
  backendPath: string,
  timeoutMs = 4000
): Promise<NextResponse | null> {
  const url = `${BACKEND_URL.replace(/\/$/, '')}${backendPath}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = new Headers();
    // Forward essential headers
    const auth = req.headers.get('authorization');
    if (auth) headers.set('authorization', auth);
    const contentType = req.headers.get('content-type');
    if (contentType) headers.set('content-type', contentType);
    headers.set('accept', 'application/json');

    const method = req.method;
    let body: BodyInit | null = null;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        const text = await req.text();
        if (text) body = text;
      } catch {
        // no body
      }
    }

    const res = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timer);

    const responseContentType = res.headers.get('content-type') || '';
    if (responseContentType.includes('application/json')) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { 'content-type': responseContentType },
    });
  } catch (err) {
    clearTimeout(timer);
    // Backend unreachable, timed out, or connection refused
    return null;
  }
}

/**
 * Proxy an SSE stream from the FastAPI backend to the Next.js client.
 * Returns null if the backend stream cannot be established.
 */
export async function forwardSseToBackend(backendPath: string): Promise<Response | null> {
  const url = `${BACKEND_URL.replace(/\/$/, '')}${backendPath}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timer);

    if (!res.ok || !res.body) {
      return null;
    }

    return new Response(res.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch {
    clearTimeout(timer);
    return null;
  }
}

