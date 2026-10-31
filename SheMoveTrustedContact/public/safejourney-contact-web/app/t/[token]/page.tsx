"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useTrip } from "@/lib/useTrip";
import { ago, clock, dur } from "@/lib/format";

const TrackMap = dynamic(() => import("@/components/TrackMap"), {
  ssr: false, loading: () => <div className="map-wrap"><div className="map" /></div>,
});

const ALERTS: Record<string, string> = {
  SOS: "SOS was pressed",
  USER_REPORTED_UNSAFE: "Reported feeling unsafe",
  MISSED_CHECKIN: "Missed a safety check-in",
  PHONE_UNREACHABLE: "Phone has gone silent",
  NO_VEHICLE_INFO: "Vehicle details not entered",
  TRIP_OVERDUE: "Trip is overdue",
  LOW_BATTERY_LAST_LOCATION: "Phone battery critically low",
};

function useNow(ms = 1000) {
  const [n, setN] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setN(Date.now()), ms); return () => clearInterval(i); }, [ms]);
  return n;
}

export default function TrackPage() {
  const { token } = useParams<{ token: string }>();
  const { trip, error, live } = useTrip(token);
  const now = useNow();
  const [toast, setToast] = useState("");
  const [perm, setPerm] = useState<string>("granted");

  const open = !!trip?.alert && ["OPEN", "ACKNOWLEDGED"].includes(trip.alert.status);
  const alertId = trip?.alert?.id;

  useEffect(() => { if ("Notification" in window) setPerm(Notification.permission); }, []);

  // Attention effects when an alert becomes active: vibrate, notify, flash tab title
  useEffect(() => {
    if (!open || !trip?.alert) return;
    navigator.vibrate?.([300, 150, 300, 150, 600]);
    if ("Notification" in window && Notification.permission === "granted")
      new Notification(`${trip.traveller_name}: ${ALERTS[trip.alert.type] ?? "Alert"}`, { body: "Open to see live location" });
    const orig = document.title; let on = true;
    const iv = setInterval(() => { document.title = on ? "🚨 ALERT · SafeJourney" : orig; on = !on; }, 800);
    return () => { clearInterval(iv); document.title = orig; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, alertId]);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2000); };
  const copy = async (text: string, msg: string) => { try { await navigator.clipboard.writeText(text); flash(msg); } catch { flash("Copy failed"); } };

  if (!trip) {
    return (
      <main className="app center">
        <h1 className="brand-lg">SafeJourney</h1>
        {error === "notfound" ? (<><h2>Link unavailable</h2><p className="muted">This tracking link is invalid or has expired. Ask the traveller to share a new one.</p></>)
          : error === "network" ? (<><h2>Can’t reach the server</h2><p className="muted">Retrying automatically…</p></>)
          : (<p className="muted">Loading journey…</p>)}
      </main>
    );
  }

  const loc = trip.last_location;
  const done = trip.status === "COMPLETED";
  const cancelled = trip.status === "CANCELLED";
  const ended = done || cancelled;
  const unreachable = open && trip.alert?.type === "PHONE_UNREACHABLE";
  const age = loc ? (now - Date.parse(loc.ts)) / 1000 : null;
  const stale = !ended && age !== null && age > 60;
  const left = (Date.parse(trip.ends_at) - now) / 1000;
  const maps = loc ? `https://www.google.com/maps?q=${loc.lat},${loc.lng}` : "";

  const chip = done ? { t: "Reached safely", c: "blue" }
    : cancelled ? { t: "Trip cancelled", c: "mute" }
    : unreachable ? { t: "Phone unreachable", c: "red" }
    : open ? { t: "Alert", c: "red" }
    : trip.status === "AWAITING_VEHICLE" ? { t: "Starting", c: "mute" }
    : trip.status === "CHECKIN_PENDING" ? { t: "Checking in", c: "blue" }
    : { t: "On the way", c: "blue" };

  return (
    <main className="app">
      <header className="top">
        <span className="brand">SafeJourney</span>
        {!ended && <span className={`live ${live ? "on" : ""}`}><i />{live ? "Live" : "Reconnecting"}</span>}
      </header>

      {open && trip.alert && (
        <section className="banner" role="alert">
          <strong>{ALERTS[trip.alert.type] ?? "Safety alert"}</strong>
          <p>
            {unreachable
              ? `Showing last known location${loc ? ` from ${ago(age ?? 0)}` : ""}.`
              : `Raised at ${clock(trip.alert.raised_at)}. Police have been notified.`}
          </p>
          <div className="row">
            <a className="btn danger" href="tel:112">Call 112</a>
            {trip.traveller_phone && <a className="btn ghost" href={`tel:${trip.traveller_phone}`}>Call {trip.traveller_name}</a>}
          </div>
        </section>
      )}
      {!open && trip.alert && ["RESOLVED", "FALSE_ALARM"].includes(trip.alert.status) && !ended && (
        <section className="note">Earlier alert was {trip.alert.status === "FALSE_ALARM" ? "marked a false alarm" : "resolved"}.</section>
      )}

      <section className="card hero">
        <div>
          <h1>{trip.traveller_name}</h1>
          <p className="muted">{done ? `Arrived at ${clock(trip.completed_at)}` : cancelled ? "Journey was cancelled" : `Started ${clock(trip.started_at)}`}</p>
        </div>
        <span className={`chip ${chip.c}`}>{chip.t}</span>
      </section>

      {done ? (
        <section className="card done">
          <div className="tick">✓</div>
          <h2>{trip.traveller_name} has reached safely</h2>
          <p className="muted">Live location sharing has ended. You can close this page.</p>
        </section>
      ) : cancelled ? null : (
        <>
          <TrackMap loc={loc} trail={trip.trail} alert={open} stale={stale} />
          <div className="grid">
            <div className="stat"><span>Last update</span><b className={stale ? "bad" : ""}>{age === null ? "–" : ago(age)}</b></div>
            <div className="stat"><span>{left >= 0 ? "Time left" : "Overdue by"}</span><b className={left < 0 ? "bad" : ""}>{dur(left)}</b></div>
            <div className="stat"><span>Battery</span><b className={(trip.battery ?? 100) <= 15 ? "bad" : ""}>{trip.battery != null ? `${trip.battery}%` : "–"}</b></div>
            <div className="stat"><span>Last check-in</span><b>{trip.last_checkin_at ? ago((now - Date.parse(trip.last_checkin_at)) / 1000) : "–"}</b></div>
          </div>
          <section className="card vehicle">
            <div><span className="muted">Vehicle number</span><b>{trip.vehicle_number ?? "Not entered yet"}</b></div>
            {trip.vehicle_number && <button className="btn ghost sm" onClick={() => copy(trip.vehicle_number!, "Vehicle number copied")}>Copy</button>}
          </section>
          <div className="actions">
            {loc && <a className="btn primary" href={maps} target="_blank" rel="noreferrer">Open in Maps</a>}
            {loc && <button className="btn ghost" onClick={() => copy(maps, "Location link copied")}>Copy location</button>}
            {!open && <a className="btn ghost" href="tel:112">Call 112</a>}
            {!open && trip.traveller_phone && <a className="btn ghost" href={`tel:${trip.traveller_phone}`}>Call {trip.traveller_name}</a>}
          </div>
        </>
      )}

      {error === "network" && <p className="note">Connection issue. Showing the last received data.</p>}
      {perm === "default" && !ended && (
        <button className="link" onClick={async () => setPerm(await Notification.requestPermission())}>Enable alert notifications on this device</button>
      )}
      <footer className="foot">Shared by {trip.traveller_name} for safety. Location is only visible during the journey.</footer>
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
