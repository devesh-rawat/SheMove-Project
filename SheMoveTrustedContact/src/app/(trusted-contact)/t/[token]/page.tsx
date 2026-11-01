'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Trip, Alert } from '@/lib/types';
import { useTrip } from '@/lib/useTrip';
import { ago, dur, clock } from '@/lib/format';
import { soundManager } from '@/lib/sound';
import './contact.css';

// Dynamically import Leaflet Map to avoid SSR errors
const ContactMap = dynamic(
  () => import('@/components/contact/ContactMap').then((m) => m.ContactMap),
  {
    ssr: false,
    loading: () => (
      <div className="mapw">
        <div className="map" style={{ display: 'grid', placeItems: 'center', color: 'var(--mute)' }}>
          Loading map…
        </div>
      </div>
    ),
  }
);

const ALERTS_DESC: Record<string, string> = {
  SOS: 'SOS was pressed',
  USER_REPORTED_UNSAFE: 'Reported feeling unsafe',
  MISSED_CHECKIN: 'Missed a safety check-in',
  PHONE_UNREACHABLE: 'Phone has gone silent',
  NO_VEHICLE_INFO: 'Vehicle details not entered',
  TRIP_OVERDUE: 'Trip is overdue',
  LOW_BATTERY_LAST_LOCATION: 'Phone battery critically low',
};

const DEMO_PERSONAS = [
  { name: 'Priya Sharma', token: 'tok-priya-sharma-safe-journey-9982' },
  { name: 'Ananya Verma', token: 'tok-ananya-verma-safe-journey-5521' },
  { name: 'Sneha Patel', token: 'tok-sneha-patel-safe-journey-1102' },
  { name: 'Ritu Mukherjee', token: 'tok-ritu-mukherjee-safe-journey-7719' },
];

function useNow(ms = 1000) {
  const [n, setN] = useState<number>(0);
  useEffect(() => {
    setN(Date.now());
    const i = setInterval(() => setN(Date.now()), ms);
    return () => clearInterval(i);
  }, [ms]);
  return n || (typeof window !== 'undefined' ? Date.now() : 0);
}

function ContactTrackingView() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const { trip, allTrips, error, live, refetch, setTrip } = useTrip(token);
  const now = useNow();

  const [toast, setToast] = useState<string>('');
  const [perm, setPerm] = useState<string>('granted');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPerm(Notification.permission);
    }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(msg);
    } catch {
      showToast('Copy failed');
    }
  };

  // ── Derive state automatically from live server data ──
  const loc = trip?.last_location;
  const age = loc && trip?.last_heartbeat_at && now ? (now - Date.parse(trip.last_heartbeat_at)) / 1000 : null;
  const isDone = trip?.status === 'COMPLETED';
  const isCancelled = trip?.status === 'CANCELLED';
  const isEnded = isDone || isCancelled;

  const openAlert = trip?.alerts.find(
    (a) => a.status === 'OPEN' || a.status === 'ACKNOWLEDGED'
  );

  const isUnreachable = !isDone && (
    openAlert?.type === 'PHONE_UNREACHABLE' || (age !== null && age > 80)
  );
  const isEmergency = !isDone && !isUnreachable && (
    trip?.status === 'ALERT_RAISED' || !!openAlert
  );
  const stale = !isDone && age !== null && age > 60;

  // currentMode is derived cleanly from active trip state
  const currentMode: 'live' | 'alert' | 'silent' | 'done' = useMemo(() => {
    if (isDone) return 'done';
    if (isUnreachable) return 'silent';
    if (isEmergency) return 'alert';
    return 'live';
  }, [isDone, isUnreachable, isEmergency]);

  // Alert attention effects: audio siren, device vibrate, flashing tab title
  useEffect(() => {
    if (!isEmergency || !openAlert || !trip) return;

    if (openAlert.severity === 'CRITICAL') {
      soundManager.playCriticalAlertSiren();
    } else {
      soundManager.playHighAlertBeep();
    }

    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([300, 150, 300, 150, 600]);
    }

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(
          `${trip.traveller_name}: ${ALERTS_DESC[openAlert.type] ?? 'Safety Alert'}`,
          { body: 'Open tracking page to inspect live location.' }
        );
      } catch {}
    }

    const origTitle = document.title;
    let on = true;
    const interval = setInterval(() => {
      document.title = on ? '🚨 ALERT · SafeJourney' : origTitle;
      on = !on;
    }, 800);

    return () => {
      clearInterval(interval);
      document.title = origTitle;
    };
  }, [isEmergency, openAlert?.id, trip?.traveller_name]);

  // ── Mode Switch Controller (Optimistic Instant Response + Server Sync) ──
  const MODES: ('live' | 'alert' | 'silent' | 'done')[] = ['live', 'alert', 'silent', 'done'];
  const MODE_LABELS: Record<string, string> = {
    live: 'Live GPS Tracking',
    alert: 'Alert Mode',
    silent: 'Phone Silent',
    done: 'Reached Safely',
  };

  const handleSwitchMode = async (targetMode: 'live' | 'alert' | 'silent' | 'done') => {
    if (!trip) return;
    if (currentMode === targetMode) {
      showToast(`Already in ${MODE_LABELS[targetMode]}`);
      return;
    }

    const nowIso = new Date().toISOString();

    // 1. Instant optimistic state update (0ms perceived lag)
    const optimisticTrip: Trip = { ...trip };

    if (targetMode === 'live') {
      optimisticTrip.status = 'ACTIVE';
      optimisticTrip.last_heartbeat_at = nowIso;
      optimisticTrip.last_battery_pct = Math.max(optimisticTrip.last_battery_pct ?? 76, 76);
      optimisticTrip.completed_at = undefined;
      optimisticTrip.alerts = optimisticTrip.alerts.map((a) =>
        a.status === 'OPEN' || a.status === 'ACKNOWLEDGED'
          ? { ...a, status: 'RESOLVED' as const, resolved_at: nowIso }
          : a
      );
      if (
        optimisticTrip.destination &&
        Math.hypot(
          optimisticTrip.last_location.lat - optimisticTrip.destination.lat,
          optimisticTrip.last_location.lng - optimisticTrip.destination.lng
        ) < 0.001
      ) {
        if (optimisticTrip.location_history.length > 0) {
          optimisticTrip.last_location = {
            lat: optimisticTrip.location_history[0].lat,
            lng: optimisticTrip.location_history[0].lng,
          };
          optimisticTrip.location_history = optimisticTrip.location_history.slice(0, 3);
        }
      }
    } else if (targetMode === 'alert') {
      optimisticTrip.status = 'ALERT_RAISED';
      optimisticTrip.last_heartbeat_at = nowIso;
      optimisticTrip.last_battery_pct = Math.max(optimisticTrip.last_battery_pct ?? 52, 52);
      optimisticTrip.completed_at = undefined;
      // Resolve phone unreachable alerts
      const updatedAlerts = optimisticTrip.alerts.map((a) =>
        a.type === 'PHONE_UNREACHABLE' && (a.status === 'OPEN' || a.status === 'ACKNOWLEDGED')
          ? { ...a, status: 'RESOLVED' as const, resolved_at: nowIso }
          : a
      );
      const hasEmergency = updatedAlerts.some(
        (a) => (a.status === 'OPEN' || a.status === 'ACKNOWLEDGED') && a.type !== 'PHONE_UNREACHABLE'
      );
      if (!hasEmergency) {
        updatedAlerts.unshift({
          id: `alt-sos-${Date.now()}`,
          trip_id: trip.id,
          type: 'SOS',
          severity: 'CRITICAL',
          status: 'OPEN',
          raised_at: nowIso,
          location: { ...optimisticTrip.last_location },
          station_id: trip.current_station_id,
          station_name: trip.current_station_name,
          snapshot: {
            traveller_name: trip.traveller_name,
            traveller_phone: trip.traveller_phone,
            vehicle_number: trip.vehicle_number || 'DL 01 TA 4421',
            battery_pct: optimisticTrip.last_battery_pct,
            accuracy_m: optimisticTrip.last_accuracy_m,
            speed_kmh: 0,
          },
        });
      }
      optimisticTrip.alerts = updatedAlerts;
    } else if (targetMode === 'silent') {
      optimisticTrip.status = 'ALERT_RAISED';
      optimisticTrip.last_heartbeat_at = new Date(Date.now() - 110000).toISOString();
      optimisticTrip.last_battery_pct = 4;
      optimisticTrip.completed_at = undefined;
      const updatedAlerts = optimisticTrip.alerts.map((a) =>
        a.type !== 'PHONE_UNREACHABLE' && (a.status === 'OPEN' || a.status === 'ACKNOWLEDGED')
          ? { ...a, status: 'RESOLVED' as const, resolved_at: nowIso }
          : a
      );
      const existingSilent = updatedAlerts.find((a) => a.type === 'PHONE_UNREACHABLE');
      if (existingSilent) {
        existingSilent.status = 'OPEN';
        existingSilent.raised_at = new Date(Date.now() - 30000).toISOString();
      } else {
        updatedAlerts.unshift({
          id: `alt-silent-${Date.now()}`,
          trip_id: trip.id,
          type: 'PHONE_UNREACHABLE',
          severity: 'HIGH',
          status: 'OPEN',
          raised_at: new Date(Date.now() - 30000).toISOString(),
          location: { ...optimisticTrip.last_location },
          station_id: trip.current_station_id,
          station_name: trip.current_station_name,
          snapshot: {
            traveller_name: trip.traveller_name,
            traveller_phone: trip.traveller_phone,
            vehicle_number: trip.vehicle_number || 'DL 01 TA 4421',
            battery_pct: 4,
            accuracy_m: 18.0,
            speed_kmh: 0,
          },
        });
      }
      optimisticTrip.alerts = updatedAlerts;
    } else if (targetMode === 'done') {
      optimisticTrip.status = 'COMPLETED';
      optimisticTrip.completed_at = nowIso;
      if (optimisticTrip.destination) {
        optimisticTrip.last_location = { ...optimisticTrip.destination };
      }
      optimisticTrip.alerts = optimisticTrip.alerts.map((a) =>
        a.status === 'OPEN' || a.status === 'ACKNOWLEDGED'
          ? { ...a, status: 'RESOLVED' as const, resolved_at: nowIso }
          : a
      );
    }

    setTrip(optimisticTrip);
    showToast(`Switched to ${MODE_LABELS[targetMode]}`);

    // 2. Synchronize with server in background
    try {
      const res = await fetch(`/api/v1/public/track/${trip.share_token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'simulate', subAction: 'set_mode', mode: targetMode }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.trip) {
          setTrip(data.trip);
        }
      }
    } catch {
      showToast('Sync delay — reconnecting…');
    }
  };

  const handleNextStage = () => {
    if (!trip) return;
    const curIdx = MODES.indexOf(currentMode);
    const nextMode = MODES[(curIdx + 1) % MODES.length];
    handleSwitchMode(nextMode);
  };

  if (error === 'notfound') {
    return (
      <div className="contact-wrap">
        <main className="app" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <img
            src="/app_icon.png"
            alt="SheMove"
            style={{ width: '64px', height: '64px', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 4px 20px rgba(124, 58, 237, 0.15)' }}
          />
          <h1 className="brand" style={{ fontSize: '26px' }}>SheMove SafeJourney</h1>
          <h2>Link unavailable</h2>
          <p className="muted">This tracking link is invalid or has expired. Ask the traveller to share a new one.</p>
        </main>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="contact-wrap">
        <main className="app" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <img
            src="/app_icon.png"
            alt="SheMove"
            style={{ width: '64px', height: '64px', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 4px 20px rgba(124, 58, 237, 0.15)' }}
          />
          <h1 className="brand" style={{ fontSize: '26px' }}>SheMove SafeJourney</h1>
          <p className="muted">
            {error === 'network' ? 'Can’t reach the server. Retrying automatically…' : 'Loading journey…'}
          </p>
        </main>
      </div>
    );
  }

  const left = trip.ends_at && now ? (Date.parse(trip.ends_at) - now) / 1000 : 0;
  const lm = Math.max(0, Math.round(left / 60));
  const mapsUrl = loc ? `https://www.google.com/maps?q=${loc.lat},${loc.lng}` : '';

  // Determine status chip text and color
  const chip = isDone
    ? { t: 'Reached safely', c: '' }
    : isCancelled
    ? { t: 'Trip cancelled', c: 'mute' }
    : isUnreachable
    ? { t: 'Phone unreachable', c: 'red' }
    : isEmergency
    ? { t: 'Alert', c: 'red' }
    : trip.status === 'AWAITING_VEHICLE'
    ? { t: 'Starting', c: 'mute' }
    : trip.status === 'CHECKIN_PENDING'
    ? { t: 'Checking in', c: '' }
    : { t: 'On the way', c: '' };

  const latestCheckin = trip.checkins.length > 0 ? trip.checkins[0] : null;
  const lastCheckinAgo = isDone
    ? 'Arrived safely'
    : latestCheckin?.responded_at && now
    ? ago((now - Date.parse(latestCheckin.responded_at)) / 1000)
    : isEmergency && !isUnreachable
    ? '7 min ago'
    : '3 min ago';

  const travellerFirstName = trip.traveller_name.split(' ')[0] || 'Traveller';

  return (
    <div className="contact-wrap">
      {/* Seamless Demo Access Control Bar */}
      <div className="demo">
        <div className="demo-header">
          <span className="demo-tag">SIMULATION DEMO</span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              className="demo-tour-btn"
              onClick={handleNextStage}
              type="button"
              title="Advance to the next journey stage"
            >
              Next Stage ⏭
            </button>
          </div>
        </div>

        {/* Interactive segmented mode controller */}
        <div className="seg" role="tablist" aria-label="Simulation modes">
          {(['live', 'alert', 'silent', 'done'] as const).map((m) => {
            const labels: Record<string, string> = {
              live: 'Live', alert: 'Alert', silent: 'Phone silent', done: 'Reached',
            };
            const passed = (['live', 'alert', 'silent', 'done'] as const).indexOf(m) <
              (['live', 'alert', 'silent', 'done'] as const).indexOf(currentMode);
            return (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={currentMode === m}
                onClick={() => handleSwitchMode(m)}
                className={currentMode === m ? 'on' : passed ? 'passed' : ''}
                title={`Switch to ${labels[m]} mode`}
              >
                {labels[m]}
              </button>
            );
          })}
        </div>

        <p className="hint">
          Tap any mode or “Next Stage” to switch instantly. Location updates smoothly every 2.5 s.
        </p>
      </div>

      <main className="app">
        {/* Top Brand Header */}
        <header className="top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src="/app_icon.png"
              alt="SheMove"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                objectFit: 'cover',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.2)',
                border: '1px solid #e2e8f0',
              }}
            />
            <span className="brand" style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
              <span>SheMove</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Escort</span>
            </span>
          </div>
          {!isEnded ? (
            <span className="live">
              <i />
              {isUnreachable ? 'Last seen' : live ? 'Live' : 'Reconnecting'}
            </span>
          ) : (
            <span className="live" style={{ color: '#4A7C59' }}>
              ✓ Completed
            </span>
          )}
        </header>

        {/* Alert / Silent Banner */}
        {(isEmergency || isUnreachable) && (
          <section className="banner" role="alert">
            <strong>
              {isUnreachable ? 'Phone has gone silent' : ALERTS_DESC[openAlert?.type ?? 'SOS'] ?? 'Safety alert'}
            </strong>
            <p>
              {isUnreachable
                ? `Showing last known location${age !== null ? ` from ${ago(age)}` : ''}. Battery critically low.`
                : `Raised at ${clock(openAlert?.raised_at ?? now)}. Police have been notified.`}
            </p>
            <div className="row">
              <a className="btn danger" href="tel:112">
                Call 112
              </a>
              {trip.traveller_phone && (
                <a className="btn" href={`tel:${trip.traveller_phone}`}>
                  Call {travellerFirstName}
                </a>
              )}
            </div>
          </section>
        )}

        {/* Hero Card */}
        <section className="card hero">
          <div>
            <h1>{travellerFirstName}</h1>
            <p className="muted">
              {isDone
                ? `Arrived at ${clock(trip.completed_at || now)}`
                : isCancelled
                ? 'Journey was cancelled'
                : `Started ${clock(trip.started_at)}`}
            </p>
          </div>
          <span className={`chip ${chip.c}`}>{chip.t}</span>
        </section>

        {/* Safe Arrival Card when completed */}
        {isDone && (
          <section className="card done">
            <div className="tick">✓</div>
            <h2>{travellerFirstName} has reached safely</h2>
            <p className="muted">
              Live location sharing ended at {clock(trip.completed_at || now)}. Destination:{' '}
              {trip.destination_name || 'Home'}.
            </p>
          </section>
        )}

        {/* Interactive Leaflet Map - ALWAYS LOADED IN MAP AREA ACROSS ALL MODES */}
        <ContactMap
          lastLocation={trip.last_location}
          accuracyM={trip.last_accuracy_m}
          locationHistory={trip.location_history}
          isEmergency={isEmergency}
          isStale={stale || isUnreachable}
          destination={trip.destination}
          destinationName={trip.destination_name}
          isDone={isDone}
        />

        {/* 4-Stat Grid */}
        <div className="grid">
          <div className="stat">
            <span>Last update</span>
            <b className={stale ? 'bad' : ''}>
              {isDone ? 'Trip ended' : age === null ? '–' : ago(age)}
            </b>
          </div>
          <div className="stat">
            <span>{isDone ? 'Trip status' : left >= 0 ? 'Time left' : 'Overdue by'}</span>
            <b className={!isDone && left < 0 ? 'bad' : ''}>
              {isDone ? 'Completed' : `${lm} min`}
            </b>
          </div>
          <div className="stat">
            <span>Battery</span>
            <b className={(trip.last_battery_pct ?? 100) <= 15 ? 'bad' : ''}>
              {trip.last_battery_pct != null ? `${trip.last_battery_pct}%` : '–'}
            </b>
          </div>
          <div className="stat">
            <span>Last check-in</span>
            <b>{lastCheckinAgo}</b>
          </div>
        </div>

        {/* Vehicle Card */}
        <section className="card vehicle">
          <div>
            <span className="muted">Vehicle number</span>
            <b>{trip.vehicle_number ?? 'Not entered yet'}</b>
          </div>
          {trip.vehicle_number && (
            <button
              className="btn sm"
              onClick={() => copy(trip.vehicle_number!, 'Vehicle number copied')}
              type="button"
            >
              Copy
            </button>
          )}
        </section>

        {/* Action Buttons Grid */}
        <div className="actions">
          {loc && (
            <a className="btn primary" href={mapsUrl} target="_blank" rel="noreferrer">
              Open in Maps
            </a>
          )}
          {loc && (
            <button
              className="btn"
              onClick={() => copy(mapsUrl, 'Location link copied')}
              type="button"
            >
              Copy location
            </button>
          )}
          {!isEmergency && !isUnreachable && (
            <a className="btn" href="tel:112">
              Call 112
            </a>
          )}
          {!isEmergency && !isUnreachable && trip.traveller_phone && (
            <a className="btn" href={`tel:${trip.traveller_phone}`}>
              Call {travellerFirstName}
            </a>
          )}
        </div>

        {/* Switch Persona Demo Pill List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--mute)' }}>Switch demo traveller:</span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {DEMO_PERSONAS.map((p) => (
              <button
                key={p.token}
                onClick={() => router.push(`/t/${p.token}`)}
                type="button"
                style={{
                  background: p.token === token ? 'var(--blue)' : 'var(--card)',
                  color: p.token === token ? 'var(--on-blue)' : 'var(--ink)',
                  border: '1px solid var(--line)',
                  borderRadius: '999px',
                  fontSize: '11px',
                  padding: '3px 9px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Permission Request */}
        {perm === 'default' && !isEnded && (
          <button
            className="link"
            style={{
              background: 'none',
              border: 0,
              color: 'var(--blue-d)',
              fontSize: '14px',
              textDecoration: 'underline',
              cursor: 'pointer',
              textAlign: 'center',
              marginTop: '6px',
            }}
            onClick={async () => {
              if (typeof window !== 'undefined' && 'Notification' in window) {
                const p = await Notification.requestPermission();
                setPerm(p);
                if (p === 'granted') showToast('Alert notifications enabled');
              }
            }}
          >
            Enable alert notifications on this device
          </button>
        )}

        {/* Footer */}
        <footer className="foot">
          Shared by {trip.traveller_name} for safety. Location is only visible during the journey.
        </footer>

        {/* Floating Toast Pill */}
        {toast && <div className="toast">{toast}</div>}
      </main>
    </div>
  );
}

export default function ContactTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="contact-wrap">
          <main className="app" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <p className="muted">Loading journey…</p>
          </main>
        </div>
      }
    >
      <ContactTrackingView />
    </Suspense>
  );
}
