'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Trip, Alert, LocationPoint } from './types';

const MOCK = process.env.NEXT_PUBLIC_MOCK === '1';

export interface WsEvent {
  type: 'location' | 'status' | 'alert' | 'checkin' | 'completed';
  ts: string;
  data: any;
}

export function applyEvent(t: Trip, e: WsEvent): Trip {
  const d = e.data ?? {};
  switch (e.type) {
    case 'location': {
      const p = {
        id: `lp-${Date.now()}`,
        lat: d.lat,
        lng: d.lng,
        accuracy_m: d.accuracy_m ?? 8,
        speed_kmh: d.speed_kmh ?? 20,
        heading: d.heading ?? 0,
        battery_pct: d.battery ?? t.last_battery_pct,
        is_charging: false,
        network: '5G',
        recorded_at: d.ts ?? e.ts,
      };
      return {
        ...t,
        last_location: { lat: d.lat, lng: d.lng },
        last_accuracy_m: d.accuracy_m ?? t.last_accuracy_m,
        last_battery_pct: d.battery ?? t.last_battery_pct,
        last_heartbeat_at: d.ts ?? e.ts,
        location_history: [...t.location_history, p].slice(-100),
      };
    }
    case 'status':
      return { ...t, status: d.status };
    case 'alert': {
      const existingIdx = t.alerts.findIndex((a) => a.id === d.id);
      let updatedAlerts = [...t.alerts];
      if (existingIdx >= 0) {
        updatedAlerts[existingIdx] = { ...updatedAlerts[existingIdx], ...d };
      } else {
        updatedAlerts.unshift(d);
      }
      return {
        ...t,
        alerts: updatedAlerts,
        status: d.status === 'OPEN' || d.status === 'ACKNOWLEDGED' ? 'ALERT_RAISED' : t.status,
      };
    }
    case 'checkin':
      return { ...t, checkin_deadline_at: d.responded_at ?? e.ts };
    case 'completed':
      return { ...t, status: 'COMPLETED' };
  }
  return t;
}

/**
 * Hook providing live trip tracking with:
 * - REST snapshot from /api/v1/public/track/[token]
 * - SSE stream from /api/v1/police/stream with exponential-backoff reconnect
 * - 8s fallback polling when SSE is down
 * - Automatic real-time location advance every 2.5s in live/alert mode (demo)
 * - Optional NEXT_PUBLIC_MOCK=1 simulated journey
 */
export function useTrip(token: string) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<'notfound' | 'network' | null>(null);
  const [live, setLive] = useState<boolean>(false);
  const gone = useRef(false);
  const tripRef = useRef<Trip | null>(null);
  const liveRef = useRef(false);

  // Keep refs in sync for use inside intervals (avoids stale closure)
  useEffect(() => { tripRef.current = trip; }, [trip]);
  useEffect(() => { liveRef.current = live; }, [live]);

  const snapshot = useCallback(async () => {
    if (gone.current) return;
    try {
      const r = await fetch(`/api/v1/public/track/${token}`, { cache: 'no-store' });
      if (r.status === 404 || r.status === 410) {
        gone.current = true;
        setError('notfound');
        return;
      }
      if (r.ok) {
        const json = await r.json();
        if (json.trip) {
          setTrip(json.trip);
          setError(null);
        }
        // Fetch full police trips in background for demo personas without blocking
        fetch('/api/v1/police/trips')
          .then((res) => res.json())
          .then((policeData) => {
            if (policeData?.trips) {
              setAllTrips(policeData.trips);
            }
          })
          .catch(() => null);
        return;
      }

      // Fallback: police trips list
      const fallbackRes = await fetch('/api/v1/police/trips');
      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        if (data.trips?.length > 0) {
          setAllTrips(data.trips);
          const found =
            data.trips.find((t: Trip) => t.share_token === token || t.id === token) ||
            data.trips[0];
          setTrip(found);
          setError(null);
          return;
        }
      }
      throw new Error('no data');
    } catch {
      setError((e) => (e === 'notfound' ? e : 'network'));
    }
  }, [token]);

  useEffect(() => {
    if (MOCK) return startMock(setTrip, setLive);

    gone.current = false;
    snapshot();

    // SSE connection with exponential-backoff reconnect
    let eventSource: EventSource | null = null;
    let retryDelay = 1500;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;

    function connect() {
      if (destroyed) return;
      try {
        eventSource = new EventSource('/api/v1/police/stream');

        eventSource.onopen = () => {
          setLive(true);
          retryDelay = 1500; // reset backoff on successful connect
        };

        eventSource.onmessage = (event) => {
          if (!event.data || event.data.startsWith(':')) return;
          try {
            const payload = JSON.parse(event.data);
            if (payload.trips) {
              setAllTrips(payload.trips);
              const updated = payload.trips.find(
                (t: Trip) => t.share_token === token || t.id === token
              );
              if (updated) setTrip(updated);
            }
          } catch {
            // ignore keepalive parse errors
          }
        };

        eventSource.onerror = () => {
          setLive(false);
          eventSource?.close();
          eventSource = null;
          if (!destroyed) {
            retryTimer = setTimeout(() => {
              retryDelay = Math.min(retryDelay * 2, 30000);
              connect();
            }, retryDelay);
          }
        };
      } catch {
        setLive(false);
      }
    }

    connect();

    // Fallback polling every 8s only when SSE is disconnected
    const pollInterval = setInterval(() => {
      if (!liveRef.current && !gone.current) snapshot();
    }, 8000);

    // Real-time GPS advance every 2.5s in live/alert mode
    // The store advances position, SSE pushes the update automatically.
    const locationInterval = setInterval(async () => {
      const t = tripRef.current;
      if (!t) return;
      const isDone = t.status === 'COMPLETED' || t.status === 'CANCELLED';
      if (isDone) return;
      // Don't advance location when phone is unreachable (PHONE_UNREACHABLE alert open)
      const isUnreachable = t.alerts.some(
        (a) => a.type === 'PHONE_UNREACHABLE' && (a.status === 'OPEN' || a.status === 'ACKNOWLEDGED')
      );
      if (isUnreachable) return;
      // Advance location for active and alert states
      if (t.status === 'ACTIVE' || t.status === 'ALERT_RAISED' || t.status === 'CHECKIN_PENDING') {
        try {
          await fetch(`/api/v1/public/track/${t.share_token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'simulate', subAction: 'advance_location' }),
          });
          // SSE stream delivers the updated trip state; no manual refetch needed
        } catch {
          // network glitch — SSE or next poll will catch up
        }
      }
    }, 2500);

    return () => {
      destroyed = true;
      gone.current = true;
      if (retryTimer) clearTimeout(retryTimer);
      eventSource?.close();
      clearInterval(pollInterval);
      clearInterval(locationInterval);
    };
  }, [token, snapshot]);

  return { trip, allTrips, error, live, refetch: snapshot, setTrip };
}

/** Simulated trip for hackathon demo mode (NEXT_PUBLIC_MOCK=1) */
function startMock(
  setTrip: Dispatch<SetStateAction<Trip | null>>,
  setLive: (v: boolean) => void
) {
  const now = Date.now();
  setLive(true);

  const initialMockTrip: Trip = {
    id: 'mock-trip-01',
    traveller_id: 'usr-mock',
    traveller_name: 'Priya Sharma',
    traveller_phone: '+91 98711 23450',
    status: 'ACTIVE',
    started_at: new Date(now - 10 * 60e3).toISOString(),
    expected_duration_s: 2700,
    ends_at: new Date(now + 35 * 60e3).toISOString(),
    destination_name: 'Lajpat Nagar Ring Road',
    destination: { lat: 28.5677, lng: 77.2433 },
    vehicle_number: 'DL 01 TA 4421',
    vehicle_entered_at: new Date(now - 8 * 60e3).toISOString(),
    vehicle_deadline_at: new Date(now - 5 * 60e3).toISOString(),
    next_checkin_due_at: new Date(now + 4 * 60e3).toISOString(),
    checkin_deadline_at: new Date(now + 5 * 60e3).toISOString(),
    last_heartbeat_at: new Date(now - 10e3).toISOString(),
    last_location: { lat: 28.6315, lng: 77.2185 },
    last_accuracy_m: 6.5,
    last_battery_pct: 78,
    current_station_id: 'st-cp-01',
    current_station_name: 'Central Division - Connaught Place PS',
    share_token: 'tok-priya-sharma-safe-journey-9982',
    contacts: [
      {
        id: 'c-01',
        name: 'Sunita Sharma',
        phone: '+91 98102 34567',
        relation: 'Mother',
        notify_whatsapp: true,
        smsStatus: 'LINK_OPENED',
      },
    ],
    location_history: [
      {
        id: 'lp-01',
        lat: 28.636,
        lng: 77.216,
        accuracy_m: 10,
        speed_kmh: 22,
        heading: 140,
        battery_pct: 78,
        is_charging: false,
        network: '5G',
        recorded_at: new Date(now - 10 * 60e3).toISOString(),
      },
    ],
    checkins: [
      {
        id: 'chk-01',
        sequence: 1,
        asked_at: new Date(now - 6 * 60e3).toISOString(),
        deadline_at: new Date(now - 5 * 60e3).toISOString(),
        responded_at: new Date(now - 5.5 * 60e3).toISOString(),
        response: 'SAFE',
        outcome: 'OK',
      },
    ],
    alerts: [],
  };

  setTrip(initialMockTrip);

  let i = 0;
  const id = setInterval(() => {
    i++;
    const ts = new Date().toISOString();
    const evs: WsEvent[] = [];

    if (i <= 40) {
      evs.push({
        type: 'location',
        ts,
        data: {
          lat: 28.6315 + i * 0.0003,
          lng: 77.2185 + i * 0.0004,
          accuracy_m: 6.5,
          battery: Math.max(10, 78 - Math.floor(i / 5)),
          ts,
        },
      });
    }
    if (i === 12) {
      evs.push({ type: 'alert', ts, data: { id: 'alt-sim-01', trip_id: 'mock-trip-01', type: 'MISSED_CHECKIN', severity: 'HIGH', status: 'OPEN', raised_at: ts } });
    }
    if (i === 22) {
      evs.push({ type: 'alert', ts, data: { id: 'alt-sim-01', trip_id: 'mock-trip-01', type: 'MISSED_CHECKIN', severity: 'HIGH', status: 'RESOLVED', raised_at: ts } });
    }
    if (i === 41) {
      evs.push({ type: 'completed', ts, data: { completed_at: ts } });
    }

    evs.forEach((e) => setTrip((t) => (t ? applyEvent(t, e) : t)));
  }, 2000);

  return () => clearInterval(id);
}
