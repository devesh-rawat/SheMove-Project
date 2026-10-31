"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Trip, WsEvent } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const WSU = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/api/v1";
const MOCK = process.env.NEXT_PUBLIC_MOCK === "1";

export function applyEvent(t: Trip, e: WsEvent): Trip {
  const d = e.data ?? {};
  switch (e.type) {
    case "location": {
      const p = { lat: d.lat, lng: d.lng, ts: d.ts ?? e.ts };
      return {
        ...t,
        last_location: { ...p, accuracy_m: d.accuracy_m },
        battery: d.battery ?? t.battery,
        trail: [...t.trail, p].slice(-300),
      };
    }
    case "status": return { ...t, status: d.status };
    case "alert": return { ...t, alert: d };
    case "checkin": return { ...t, last_checkin_at: d.responded_at ?? e.ts };
    case "completed": return { ...t, status: "COMPLETED", completed_at: d.completed_at ?? e.ts };
  }
  return t;
}

/** Snapshot over REST, live updates over WebSocket, 10s polling fallback, auto-reconnect. */
export function useTrip(token: string) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<"notfound" | "network" | null>(null);
  const [live, setLive] = useState(false);
  const wsOpen = useRef(false);
  const gone = useRef(false);

  const snapshot = useCallback(async () => {
    try {
      const r = await fetch(`${API}/public/track/${token}`, { cache: "no-store" });
      if (r.status === 404 || r.status === 410) { gone.current = true; setError("notfound"); return; }
      if (!r.ok) throw new Error();
      setTrip(await r.json());
      setError(null);
    } catch { setError((e) => (e === "notfound" ? e : "network")); }
  }, [token]);

  useEffect(() => {
    if (MOCK) return startMock(setTrip, setLive);
    let ws: WebSocket | null = null, retry = 0, timer: any, closed = false;
    snapshot();
    const connect = () => {
      if (closed || gone.current) return;
      ws = new WebSocket(`${WSU}/ws/track/${token}`);
      ws.onopen = () => { wsOpen.current = true; retry = 0; setLive(true); snapshot(); };
      ws.onmessage = (m) => {
        try { const ev: WsEvent = JSON.parse(m.data); setTrip((t) => (t ? applyEvent(t, ev) : t)); } catch {}
      };
      ws.onclose = () => {
        wsOpen.current = false; setLive(false);
        if (!closed) timer = setTimeout(connect, Math.min(30000, 1000 * 2 ** retry++));
      };
      ws.onerror = () => ws?.close();
    };
    connect();
    const poll = setInterval(() => { if (!wsOpen.current && !gone.current) snapshot(); }, 10000);
    return () => { closed = true; clearTimeout(timer); clearInterval(poll); ws?.close(); };
  }, [token, snapshot]);

  return { trip, error, live };
}

/** Simulated trip for demos: moves, raises an alert, resolves it, then completes. */
function startMock(setTrip: Dispatch<SetStateAction<Trip | null>>, setLive: (v: boolean) => void) {
  const now = Date.now();
  setLive(true);
  setTrip({
    traveller_name: "Asha", traveller_phone: "+910000000000", status: "ACTIVE",
    vehicle_number: "DL1CAB1234", battery: 78,
    started_at: new Date(now - 5 * 60e3).toISOString(),
    ends_at: new Date(now + 25 * 60e3).toISOString(),
    last_checkin_at: new Date(now - 60e3).toISOString(),
    alert: null, trail: [], last_location: null,
  });
  let i = 0;
  const id = setInterval(() => {
    i++;
    const ts = new Date().toISOString();
    const evs: WsEvent[] = [];
    if (i <= 40) evs.push({ type: "location", ts, data: { lat: 28.6139 + i * 0.0003, lng: 77.209 + i * 0.0004, accuracy_m: 12, battery: 78 - Math.floor(i / 8), ts } });
    if (i === 12) evs.push({ type: "alert", ts, data: { id: "a1", type: "MISSED_CHECKIN", severity: "HIGH", status: "OPEN", raised_at: ts } });
    if (i === 22) evs.push({ type: "alert", ts, data: { id: "a1", type: "MISSED_CHECKIN", severity: "HIGH", status: "RESOLVED", raised_at: ts } });
    if (i === 41) evs.push({ type: "completed", ts, data: { completed_at: ts } });
    evs.forEach((e) => setTrip((t) => (t ? applyEvent(t, e) : t)));
  }, 2000);
  return () => clearInterval(id);
}
