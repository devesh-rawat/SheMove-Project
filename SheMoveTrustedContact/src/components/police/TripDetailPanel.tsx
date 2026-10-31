'use client';

import React, { useState } from 'react';
import {
  Trip,
  Alert
} from '@/lib/types';
import {
  Check,
  CheckCircle,
  Siren,
  Phone,
  PhoneCall,
  ExternalLink,
  Copy,
  Clock,
  Car,
  Shield,
  Radio,
  MapPin,
  BatteryLow,
  BatteryMedium,
  Wifi,
  Users,
  AlertTriangle,
  X,
  Lock,
  Unlock,
  Eye,
  Navigation,
  Activity
} from 'lucide-react';

interface TripDetailPanelProps {
  trip: Trip | undefined;
  onAcknowledgeAlert: (alertId: string) => void;
  onOpenResolveModal: (alertId: string) => void;
  onOpenDispatchModal: (tripId: string) => void;
  onClose?: () => void;
}

export const TripDetailPanel: React.FC<TripDetailPanelProps> = ({
  trip,
  onAcknowledgeAlert,
  onOpenResolveModal,
  onOpenDispatchModal,
  onClose,
}) => {
  const [copiedCoords, setCopiedCoords] = useState(false);

  if (!trip) {
    return (
      <aside className="w-full md:w-96 lg:w-[400px] flex flex-col items-center justify-center p-8 text-center select-none"
        style={{ background: '#07101f', borderLeft: '1px solid #0f2040' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: '#0a1628', border: '1px solid #1e3a5f' }}>
          <Shield className="w-8 h-8" style={{ color: '#1e3a5f' }} />
        </div>
        <div className="font-bold text-sm" style={{ color: '#334155' }}>No Journey Selected</div>
        <div className="text-xs mt-2 leading-relaxed" style={{ color: '#1e3a5f' }}>
          Select a trip or alert from the queue to view the full incident dossier
        </div>
      </aside>
    );
  }

  const activeAlert = trip.alerts.find((a) => a.status === 'OPEN' || a.status === 'ACKNOWLEDGED') || trip.alerts[0];
  const isAlertOpen = activeAlert && activeAlert.status === 'OPEN';
  const isAlertAcknowledged = activeAlert && activeAlert.status === 'ACKNOWLEDGED';
  const isAlertResolved = activeAlert && (activeAlert.status === 'RESOLVED' || activeAlert.status === 'FALSE_ALARM');
  const hasActiveAlert = isAlertOpen || isAlertAcknowledged;

  // CORE FEATURE: Only show exact location when alert is active
  const showExactLocation = hasActiveAlert;

  const copyCoordinates = () => {
    const text = `${trip.last_location.lat.toFixed(6)}, ${trip.last_location.lng.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const googleMapsUrl = `https://www.google.com/maps?q=${trip.last_location.lat},${trip.last_location.lng}`;

  const formatTime = (iso?: string) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatElapsed = (iso: string) => {
    const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (sec < 60) return `${sec}s ago`;
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    return `${Math.floor(sec / 3600)}h ago`;
  };

  const statusColors: Record<string, { bg: string; border: string; text: string }> = {
    ALERT_RAISED: { bg: '#450a0a', border: '#7f1d1d', text: '#f87171' },
    ACTIVE: { bg: '#052e16', border: '#14532d', text: '#34d399' },
    AWAITING_VEHICLE: { bg: '#431407', border: '#7c2d12', text: '#fb923c' },
    COMPLETED: { bg: '#0f172a', border: '#1e293b', text: '#64748b' },
    CHECKIN_PENDING: { bg: '#1e1b4b', border: '#3730a3', text: '#a5b4fc' },
    DRAFT: { bg: '#0f172a', border: '#1e293b', text: '#475569' },
    CANCELLED: { bg: '#0f172a', border: '#1e293b', text: '#475569' },
  };

  const statusColor = statusColors[trip.status] || statusColors.ACTIVE;

  return (
    <aside className="w-full md:w-96 lg:w-[400px] flex flex-col h-full overflow-hidden select-none"
      style={{ background: '#07101f', borderLeft: '1px solid #0f2040' }}>

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid #0f2040', background: '#060b14' }}>
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            trip.status === 'ALERT_RAISED' ? 'animate-ping bg-red-500' :
            trip.status === 'COMPLETED' ? 'bg-slate-500' :
            'animate-pulse bg-emerald-500'
          }`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{trip.traveller_name}</span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md"
                style={{ background: statusColor.bg, color: statusColor.text, border: `1px solid ${statusColor.border}` }}>
                {trip.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="text-[10px] font-mono mt-0.5" style={{ color: '#475569' }}>
              {trip.current_station_name}
            </div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg transition-all"
            style={{ color: '#475569' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#0f2040')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {/* Active Alert Action Card */}
        {activeAlert && (
          <div className="rounded-xl overflow-hidden"
            style={{
              background: activeAlert.severity === 'CRITICAL' && isAlertOpen ? '#450a0a' : isAlertResolved ? '#052e16' : '#431407',
              border: `1px solid ${activeAlert.severity === 'CRITICAL' && isAlertOpen ? '#7f1d1d' : isAlertResolved ? '#14532d' : '#7c2d12'}`,
              boxShadow: activeAlert.severity === 'CRITICAL' && isAlertOpen ? '0 0 30px #ef444420' : 'none',
              animation: activeAlert.severity === 'CRITICAL' && isAlertOpen ? 'criticalBorderPulse 2s ease-in-out infinite' : 'none',
            }}>

            {/* Alert header strip */}
            <div className="px-3 py-2 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${activeAlert.severity === 'CRITICAL' ? '#7f1d1d' : '#7c2d12'}` }}>
              <div className="flex items-center gap-2">
                <Siren className="w-4 h-4 animate-pulse" style={{ color: '#f87171' }} />
                <span className="font-black text-xs uppercase tracking-wider" style={{ color: activeAlert.severity === 'CRITICAL' ? '#fca5a5' : '#fdba74' }}>
                  {activeAlert.type.replace(/_/g, ' ')}
                </span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded"
                  style={{
                    background: activeAlert.severity === 'CRITICAL' ? '#ef4444' : '#f97316',
                    color: '#fff'
                  }}>
                  {activeAlert.severity}
                </span>
              </div>
              <span className="text-[10px] font-mono" style={{ color: '#475569' }}>
                {formatTime(activeAlert.raised_at)}
              </span>
            </div>

            <div className="p-3">
              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                {isAlertOpen && (
                  <button
                    onClick={() => onAcknowledgeAlert(activeAlert.id)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs transition-all"
                    style={{ background: 'linear-gradient(135deg,#1d4ed8,#1e40af)', color: '#fff', boxShadow: '0 0 15px #1d4ed830' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg,#2563eb,#1d4ed8)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg,#1d4ed8,#1e40af)')}>
                    <Check className="w-4 h-4" />
                    <span>Acknowledge</span>
                  </button>
                )}
                {(isAlertOpen || isAlertAcknowledged) && (
                  <button
                    onClick={() => onOpenResolveModal(activeAlert.id)}
                    className={`${isAlertOpen ? 'col-span-1' : 'col-span-2'} flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs transition-all`}
                    style={{ background: 'linear-gradient(135deg,#047857,#065f46)', color: '#fff' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg,#059669,#047857)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg,#047857,#065f46)')}>
                    <CheckCircle className="w-4 h-4" />
                    <span>Resolve Alert</span>
                  </button>
                )}
                {isAlertResolved && (
                  <div className="col-span-2 rounded-xl p-2.5 text-xs"
                    style={{ background: '#052e16', border: '1px solid #14532d' }}>
                    <div className="flex items-center gap-1.5 font-bold" style={{ color: '#34d399' }}>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Resolved: {activeAlert.resolution_outcome}
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: '#4ade80' }}>
                      {activeAlert.resolution_notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dispatch Unit */}
        <div className="rounded-xl overflow-hidden"
          style={{ background: '#0a1628', border: '1px solid #0f2040' }}>
          {trip.dispatchInfo ? (
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 animate-pulse" style={{ color: '#22d3ee' }} />
                  <span className="font-bold text-xs" style={{ color: '#22d3ee' }}>
                    Unit En Route: {trip.dispatchInfo.unit_callsign}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-lg"
                  style={{ background: '#0f2040', color: '#22d3ee', border: '1px solid #164e63' }}>
                  ETA {trip.dispatchInfo.eta_minutes}m
                </span>
              </div>
              <div className="text-xs" style={{ color: '#64748b' }}>
                Officer: <span className="font-semibold text-white">{trip.dispatchInfo.officer_in_charge}</span>
              </div>
              <div className="text-[10px] italic mt-1" style={{ color: '#334155' }}>
                "{trip.dispatchInfo.notes}"
              </div>
            </div>
          ) : (
            <button
              onClick={() => onOpenDispatchModal(trip.id)}
              className="w-full flex items-center justify-center gap-2 py-3 font-bold text-xs transition-all"
              style={{ color: '#22d3ee' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0f2040')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <Radio className="w-4 h-4" />
              <span>Dispatch 112 PCR Patrol Unit</span>
            </button>
          )}
        </div>

        {/* Location Section — GATED BY ALERT */}
        <div className="rounded-xl overflow-hidden"
          style={{ background: '#0a1628', border: `1px solid ${showExactLocation ? '#1e3a5f' : '#0f2040'}` }}>
          <div className="px-3 py-2 flex items-center justify-between"
            style={{ borderBottom: '1px solid #0f2040' }}>
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"
              style={{ color: '#475569' }}>
              <MapPin className="w-3.5 h-3.5" style={{ color: showExactLocation ? '#f87171' : '#334155' }} />
              Location
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold"
              style={{ color: showExactLocation ? '#34d399' : '#334155' }}>
              {showExactLocation ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {showExactLocation ? 'Precise (Alert Active)' : 'Privacy Protected'}
            </span>
          </div>

          {showExactLocation ? (
            <div className="p-3 space-y-2">
              {/* Exact coordinates */}
              <div className="p-2.5 rounded-lg font-mono text-xs"
                style={{ background: '#050d1a', border: '1px solid #0f2040' }}>
                <div className="text-[10px] mb-1" style={{ color: '#334155' }}>GPS Coordinates</div>
                <div className="font-bold" style={{ color: '#60a5fa' }}>
                  {trip.last_location.lat.toFixed(6)}, {trip.last_location.lng.toFixed(6)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: '#0f2040', color: '#60a5fa', border: '1px solid #1e3a5f' }}>
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Maps</span>
                </a>
                <button
                  onClick={copyCoordinates}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: '#0f2040', color: copiedCoords ? '#34d399' : '#60a5fa', border: '1px solid #1e3a5f' }}>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCoords ? 'Copied!' : 'Copy Coords'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center">
              <Lock className="w-6 h-6 mx-auto mb-2" style={{ color: '#1e3a5f' }} />
              <div className="text-xs font-semibold" style={{ color: '#334155' }}>Location Hidden</div>
              <div className="text-[10px] mt-1 leading-relaxed" style={{ color: '#1e3a5f' }}>
                Exact GPS coordinates are only revealed when an active safety alert is raised for this user
              </div>
              <div className="mt-2 text-[10px] font-bold" style={{ color: '#0f2040' }}>
                Station: {trip.current_station_name}
              </div>
            </div>
          )}
        </div>

        {/* Vehicle */}
        <div className="rounded-xl overflow-hidden"
          style={{ background: '#0a1628', border: '1px solid #0f2040' }}>
          <div className="px-3 py-2 flex items-center justify-between"
            style={{ borderBottom: '1px solid #0f2040' }}>
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"
              style={{ color: '#475569' }}>
              <Car className="w-3.5 h-3.5" style={{ color: '#38bdf8' }} />
              Registered Vehicle
            </span>
            {trip.vehicle_entered_at && (
              <span className="text-[10px] font-mono" style={{ color: '#34d399' }}>
                In: {formatTime(trip.vehicle_entered_at)}
              </span>
            )}
          </div>
          <div className="p-3 flex justify-center">
            {trip.vehicle_number ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-lg font-black font-mono"
                style={{ background: '#fbbf24', color: '#0a0a0a', boxShadow: '0 0 20px #fbbf2430' }}>
                <span className="text-[10px] font-black px-1 py-0.5 rounded" style={{ background: '#1d4ed8', color: '#fff' }}>
                  IND
                </span>
                <span className="tracking-widest">{trip.vehicle_number}</span>
              </div>
            ) : (
              <div className="text-center py-2">
                <div className="text-xs font-bold" style={{ color: '#f97316' }}>⚠️ Vehicle Plate Pending</div>
                <div className="text-[10px] mt-0.5" style={{ color: '#475569' }}>
                  Deadline: {formatTime(trip.vehicle_deadline_at)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Telemetry */}
        <div className="rounded-xl overflow-hidden"
          style={{ background: '#0a1628', border: '1px solid #0f2040' }}>
          <div className="px-3 py-2 flex items-center justify-between"
            style={{ borderBottom: '1px solid #0f2040' }}>
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"
              style={{ color: '#475569' }}>
              <Activity className="w-3.5 h-3.5" style={{ color: '#34d399' }} />
              Device Telemetry
            </span>
            <span className="flex items-center gap-1 text-[10px]" style={{ color: '#34d399' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {formatElapsed(trip.last_heartbeat_at)}
            </span>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'GPS Acc', value: `±${trip.last_accuracy_m}m`, color: '#60a5fa' },
                {
                  label: 'Speed',
                  value: `${trip.location_history.slice(-1)[0]?.speed_kmh || 0} km/h`,
                  color: '#22d3ee'
                },
                {
                  label: 'Battery',
                  value: `${trip.last_battery_pct}%`,
                  color: trip.last_battery_pct <= 10 ? '#f87171' : '#34d399'
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-2 rounded-lg"
                  style={{ background: '#050d1a', border: '1px solid #0f2040' }}>
                  <div className="text-[10px] mb-1" style={{ color: '#334155' }}>{label}</div>
                  <div className="font-mono font-bold text-sm" style={{ color }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Check-in Timeline */}
        {trip.checkins.length > 0 && (
          <div className="rounded-xl overflow-hidden"
            style={{ background: '#0a1628', border: '1px solid #0f2040' }}>
            <div className="px-3 py-2 flex items-center justify-between"
              style={{ borderBottom: '1px solid #0f2040' }}>
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"
                style={{ color: '#475569' }}>
                <Clock className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />
                Safety Check-ins ({trip.checkins.length})
              </span>
              {trip.next_checkin_due_at && (
                <span className="text-[10px] font-mono" style={{ color: '#a78bfa' }}>
                  Next: {formatTime(trip.next_checkin_due_at)}
                </span>
              )}
            </div>
            <div className="p-3 space-y-2">
              {trip.checkins.slice(-4).map((chk) => (
                <div key={chk.id} className="flex items-center justify-between p-2 rounded-lg text-xs"
                  style={{ background: '#050d1a', border: '1px solid #0f2040' }}>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      #{chk.sequence}
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded"
                        style={{
                          background: chk.outcome === 'OK' ? '#052e16' : chk.outcome === 'ALERTED_MISSED' ? '#431407' : '#450a0a',
                          color: chk.outcome === 'OK' ? '#34d399' : chk.outcome === 'ALERTED_MISSED' ? '#fb923c' : '#f87171',
                          border: `1px solid ${chk.outcome === 'OK' ? '#14532d' : chk.outcome === 'ALERTED_MISSED' ? '#7c2d12' : '#7f1d1d'}`
                        }}>
                        {chk.outcome.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: '#334155' }}>
                      {formatTime(chk.asked_at)}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-right">
                    {chk.responded_at ? (
                      <span style={{ color: '#34d399' }}>✓ {formatTime(chk.responded_at)}</span>
                    ) : (
                      <span className="font-bold" style={{ color: '#f87171' }}>NO RESPONSE</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trusted Contacts */}
        {trip.contacts.length > 0 && (
          <div className="rounded-xl overflow-hidden"
            style={{ background: '#0a1628', border: '1px solid #0f2040' }}>
            <div className="px-3 py-2 flex items-center justify-between"
              style={{ borderBottom: '1px solid #0f2040' }}>
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"
                style={{ color: '#475569' }}>
                <Users className="w-3.5 h-3.5" style={{ color: '#c084fc' }} />
                Trusted Contacts
              </span>
              <span className="text-[10px]" style={{ color: '#334155' }}>Auto-notified</span>
            </div>
            <div className="p-3 space-y-2">
              {trip.contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-2 rounded-lg"
                  style={{ background: '#050d1a', border: '1px solid #0f2040' }}>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      {contact.name}
                      <span className="text-[10px]" style={{ color: '#a78bfa' }}>({contact.relation})</span>
                    </div>
                    <div className="text-[10px] font-mono" style={{ color: '#334155' }}>
                      {contact.phone} • SMS: <span style={{ color: '#34d399' }}>{contact.smsStatus}</span>
                    </div>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="p-2 rounded-lg transition-all"
                    style={{ background: '#0f2040', color: '#34d399' }}>
                    <PhoneCall className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Direct Call */}
        <a
          href={`tel:${trip.traveller_phone}`}
          className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all"
          style={{ background: '#0f2040', color: '#34d399', border: '1px solid #14532d' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#052e16')}
          onMouseLeave={e => (e.currentTarget.style.background = '#0f2040')}>
          <Phone className="w-4 h-4" />
          <span>Call {trip.traveller_name} ({trip.traveller_phone})</span>
        </a>
      </div>
    </aside>
  );
};
