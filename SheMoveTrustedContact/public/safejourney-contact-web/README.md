# SafeJourney – Contact Tracking Web (Next.js 14)

Phone-first page that trusted contacts open from an SMS link: `/t/<share_token>`.

## Run
```bash
cp .env.example .env.local
npm install
npm run dev            # http://localhost:3000/t/anything
```
Set `NEXT_PUBLIC_MOCK=1` to see a simulated trip (location moves, alert raised, resolved, trip completes) with no backend.

## Backend contract (FastAPI)
- `GET  {API}/public/track/{token}` → `Trip` (see `lib/types.ts`). 404/410 for invalid/expired token.
- `WS   {WS}/ws/track/{token}` → JSON events `{type, ts, data}`:
  - `location`  `{lat,lng,accuracy_m,battery,ts}`
  - `alert`     `{id,type,severity,status,raised_at}` (re-send with new `status` on ack/resolve)
  - `status`    `{status}`
  - `checkin`   `{responded_at}`
  - `completed` `{completed_at}`
- CORS: allow the web origin on the REST route.
- `PHONE_UNREACHABLE` alert + frozen `last_location` is how the "phone dead" state renders ("last seen X ago").

## Behaviour
Snapshot on load/reconnect → WebSocket live updates → 10s polling if the socket is down (exponential backoff reconnect).
Stale marker (>60s) turns grey; alerts turn UI red, vibrate, flash tab title, optional browser notification.
