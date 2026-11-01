import { forwardSseToBackend } from '@/lib/backend';
import { policeStore } from '@/lib/store';

export async function GET() {
  const backendStream = await forwardSseToBackend('/api/v1/police/stream');
  if (backendStream) return backendStream;

  const encoder = new TextEncoder();


  const stream = new ReadableStream({
    start(controller) {
      // Send initial snapshot
      const initialData = {
        type: 'SNAPSHOT',
        trips: policeStore.getTrips(),
        alerts: policeStore.getAlerts(),
        stats: policeStore.getStats(),
        timestamp: new Date().toISOString(),
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`));

      // Subscribe to store updates
      const unsubscribe = policeStore.subscribe(() => {
        try {
          const updateData = {
            type: 'UPDATE',
            trips: policeStore.getTrips(),
            alerts: policeStore.getAlerts(),
            stats: policeStore.getStats(),
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(updateData)}\n\n`));
        } catch {
          // Stream might be closed
        }
      });

      // Keepalive heartbeat ping every 10 seconds
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(pingInterval);
        }
      }, 10000);

      // Cleanup when stream closes
      return () => {
        unsubscribe();
        clearInterval(pingInterval);
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
