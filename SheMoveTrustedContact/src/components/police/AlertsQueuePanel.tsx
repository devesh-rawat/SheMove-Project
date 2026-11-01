'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Siren,
  Clock,
  WifiOff,
  BatteryLow,
  BatteryMedium,
  CheckCircle2,
  Search,
  Check,
  Car,
  Shield,
  MapPin,
  Users,
  Filter,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Alert, AlertSeverity, Trip } from '@/lib/types';

interface AlertsQueuePanelProps {
  alerts: Alert[];
  trips: Trip[];
  selectedTripId?: string;
  onSelectTrip: (tripId: string) => void;
  onAcknowledgeAlert: (alertId: string) => void;
}

export const AlertsQueuePanel: React.FC<AlertsQueuePanelProps> = ({
  alerts,
  trips,
  selectedTripId,
  onSelectTrip,
  onAcknowledgeAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'overview'>('alerts');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('OPEN');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = a.snapshot.traveller_name.toLowerCase().includes(q);
      const matchPhone = a.snapshot.traveller_phone.toLowerCase().includes(q);
      const matchPlate = a.snapshot.vehicle_number?.toLowerCase().includes(q);
      const matchType = a.type.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchPlate && !matchType) return false;
    }
    return true;
  });

  // Group and deduplicate alerts per trip so each active trip has exactly 1 primary incident card
  const consolidatedAlerts = React.useMemo(() => {
    const tripMap = new Map<string, { alert: Alert; count: number }>();
    const severityScore = (s: string) => (s === 'CRITICAL' ? 3 : s === 'HIGH' ? 2 : 1);

    for (const alt of filteredAlerts) {
      const existing = tripMap.get(alt.trip_id);
      if (!existing) {
        tripMap.set(alt.trip_id, { alert: alt, count: 1 });
      } else {
        existing.count += 1;
        const currentScore = severityScore(existing.alert.severity);
        const newScore = severityScore(alt.severity);
        if (
          newScore > currentScore ||
          (newScore === currentScore && new Date(alt.raised_at) > new Date(existing.alert.raised_at))
        ) {
          existing.alert = alt;
        }
      }
    }
    return Array.from(tripMap.values());
  }, [filteredAlerts]);

  const openAlertsCount = alerts.filter((a) => a.status === 'OPEN').length;
  const criticalCount = alerts.filter((a) => a.status === 'OPEN' && a.severity === 'CRITICAL').length;
  const highCount = alerts.filter((a) => a.status === 'OPEN' && a.severity === 'HIGH').length;
  const resolvedCount = alerts.filter((a) => a.status === 'RESOLVED').length;

  // Group trips by station for overview
  const stationGroups: Record<string, { name: string; count: number; alertCount: number }> = {};
  trips.forEach((t) => {
    if (!stationGroups[t.current_station_id]) {
      stationGroups[t.current_station_id] = {
        name: t.current_station_name,
        count: 0,
        alertCount: 0,
      };
    }
    stationGroups[t.current_station_id].count++;
    if (t.status === 'ALERT_RAISED') stationGroups[t.current_station_id].alertCount++;
  });

  const formatElapsed = (iso: string) => {
    const diffSec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diffSec < 60) return `${diffSec}s`;
    const min = Math.floor(diffSec / 60);
    if (min < 60) return `${min}m`;
    return `${Math.floor(min / 60)}h`;
  };

  const severityColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    CRITICAL: { bg: '#450a0a', border: '#7f1d1d', text: '#f87171', dot: '#ef4444' },
    HIGH: { bg: '#431407', border: '#7c2d12', text: '#fb923c', dot: '#f97316' },
    MEDIUM: { bg: '#422006', border: '#92400e', text: '#fbbf24', dot: '#f59e0b' },
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SOS':
      case 'USER_REPORTED_UNSAFE':
        return <Siren className="w-3.5 h-3.5 animate-pulse" style={{ color: '#f87171' }} />;
      case 'MISSED_CHECKIN':
        return <Clock className="w-3.5 h-3.5" style={{ color: '#fb923c' }} />;
      case 'PHONE_UNREACHABLE':
        return <WifiOff className="w-3.5 h-3.5" style={{ color: '#f43f5e' }} />;
      default:
        return <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#fbbf24' }} />;
    }
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 flex flex-col h-full overflow-hidden select-none"
      style={{ background: '#07101f', borderRight: '1px solid #0f2040' }}>

      {/* Tab Header */}
      <div className="px-3 pt-3 pb-0">
        <div className="flex gap-1 p-1 rounded-xl"
          style={{ background: '#050d1a', border: '1px solid #0f2040' }}>
          <button
            onClick={() => setActiveTab('alerts')}
            className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            style={{
              background: activeTab === 'alerts' ? '#0f2040' : 'transparent',
              color: activeTab === 'alerts' ? '#e2e8f0' : '#475569',
              border: activeTab === 'alerts' ? '1px solid #1e3a5f' : '1px solid transparent',
            }}>
            <div className="relative">
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: criticalCount > 0 ? '#f87171' : '#fb923c' }} />
              {criticalCount > 0 && (
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              )}
            </div>
            <span>Priority Alerts</span>
            {openAlertsCount > 0 && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                style={{ background: criticalCount > 0 ? '#ef4444' : '#f97316', color: '#fff' }}>
                {openAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            style={{
              background: activeTab === 'overview' ? '#0f2040' : 'transparent',
              color: activeTab === 'overview' ? '#e2e8f0' : '#475569',
              border: activeTab === 'overview' ? '1px solid #1e3a5f' : '1px solid transparent',
            }}>
            <Users className="w-3.5 h-3.5" style={{ color: '#38bdf8' }} />
            <span>Zone Overview</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: '#0f2040', color: '#94a3b8', border: '1px solid #1e3a5f' }}>
              {trips.length}
            </span>
          </button>
        </div>

        {/* Summary pills */}
        {activeTab === 'alerts' && (
          <div className="flex items-center gap-1.5 mt-3 mb-3">
            {[
              { label: 'CRITICAL', count: criticalCount, bg: '#7f1d1d', color: '#f87171' },
              { label: 'HIGH', count: highCount, bg: '#7c2d12', color: '#fb923c' },
              { label: 'RESOLVED', count: resolvedCount, bg: '#052e16', color: '#34d399' },
            ].map(({ label, count, bg, color }) => (
              <div key={label} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
                style={{ background: bg + '40', border: `1px solid ${bg}`, color }}>
                <span>{count}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search + Filters */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#334155' }} />
          <input
            type="text"
            placeholder={activeTab === 'alerts' ? 'Search alerts, name, plate...' : 'Search station, traveller...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-lg text-xs focus:outline-none transition"
            style={{
              background: '#050d1a',
              border: '1px solid #0f2040',
              color: '#e2e8f0',
            }}
          />
        </div>

        {activeTab === 'alerts' && (
          <div className="flex items-center gap-1.5 mt-2">
            {['ALL', 'CRITICAL', 'HIGH'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className="px-2 py-0.5 rounded-md text-[10px] font-bold transition-all"
                style={{
                  background: severityFilter === sev
                    ? (sev === 'CRITICAL' ? '#ef4444' : sev === 'HIGH' ? '#f97316' : '#3b82f6')
                    : '#050d1a',
                  color: severityFilter === sev ? '#fff' : '#475569',
                  border: `1px solid ${severityFilter === sev ? 'transparent' : '#0f2040'}`,
                }}>
                {sev}
              </button>
            ))}
            <div className="flex-1" />
            {['OPEN', 'ACK', 'ALL'].map((st) => {
              const val = st === 'ACK' ? 'ACKNOWLEDGED' : st;
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(val)}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all"
                  style={{
                    background: statusFilter === val ? '#1e3a5f' : 'transparent',
                    color: statusFilter === val ? '#93c5fd' : '#334155',
                  }}>
                  {st}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
        {activeTab === 'alerts' ? (
          consolidatedAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: '#052e1640', border: '1px solid #14532d40' }}>
                <CheckCircle2 className="w-7 h-7" style={{ color: '#34d399' }} />
              </div>
              <div className="text-sm font-bold" style={{ color: '#64748b' }}>All Clear</div>
              <div className="text-xs mt-1" style={{ color: '#334155' }}>No active alerts in this view</div>
            </div>
          ) : (
            consolidatedAlerts.map(({ alert: alt, count }) => {
              const isSelected = alt.trip_id === selectedTripId;
              const isCritical = alt.severity === 'CRITICAL';
              const isOpen = alt.status === 'OPEN';
              const colors = severityColors[alt.severity] || severityColors.MEDIUM;
              const parentTrip = trips.find((t) => t.id === alt.trip_id);
              const isRealUser = parentTrip
                ? parentTrip.is_simulation === false || parentTrip.source === 'mobile_app'
                : alt.is_simulation === false || alt.source === 'mobile_app';

              return (
                <div
                  key={alt.id}
                  onClick={() => onSelectTrip(alt.trip_id)}
                  className="relative rounded-xl p-3 cursor-pointer transition-all"
                  style={{
                    background: isSelected
                      ? '#0f2040'
                      : isCritical && isOpen
                      ? colors.bg
                      : '#0a1628',
                    border: `1px solid ${isSelected ? '#3b82f6' : isCritical && isOpen ? colors.border : '#0f2040'}`,
                    boxShadow: isSelected
                      ? '0 0 0 1px #3b82f680, inset 0 1px 0 #ffffff08'
                      : isCritical && isOpen
                      ? '0 0 20px #ef444420'
                      : 'none',
                    animation: isCritical && isOpen ? 'criticalBorderPulse 2s ease-in-out infinite' : 'none',
                  }}>

                  {/* Critical glow strip */}
                  {isCritical && isOpen && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                      style={{ background: colors.dot, boxShadow: `0 0 10px ${colors.dot}` }} />
                  )}

                  <div className="flex items-start justify-between mb-2 pl-1">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(alt.type)}
                      <span className="text-[10px] font-black uppercase tracking-wider"
                        style={{ color: colors.text }}>
                        {alt.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[9px] font-black px-1.5 rounded"
                        style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                        {alt.severity}
                      </span>
                      {count > 1 && (
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          {count} INCIDENTS
                        </span>
                      )}
                      {isRealUser && (
                        <span className="flex items-center gap-1 text-[8px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          LIVE APP
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono shrink-0" style={{ color: '#475569' }}>
                      {formatElapsed(alt.raised_at)} ago
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-2 pl-1">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {alt.snapshot.traveller_name}
                      </div>
                      <div className="text-[10px] font-mono mt-0.5" style={{ color: '#475569' }}>
                        {alt.snapshot.traveller_phone}
                      </div>
                    </div>
                    <div className="px-2 py-0.5 rounded font-mono text-[10px] font-black"
                      style={{ background: '#fbbf2420', color: '#fbbf24', border: '1px solid #d9770640' }}>
                      {alt.snapshot.vehicle_number || 'NO PLATE'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 pl-1"
                    style={{ borderTop: '1px solid #0f2040' }}>
                    <div className="flex items-center gap-2 text-[10px]" style={{ color: '#475569' }}>
                      {alt.snapshot.battery_pct <= 15 ? (
                        <BatteryLow className="w-3 h-3" style={{ color: '#f87171' }} />
                      ) : (
                        <BatteryMedium className="w-3 h-3" style={{ color: '#34d399' }} />
                      )}
                      <span className="font-mono">{alt.snapshot.battery_pct}%</span>
                      <span>•</span>
                      <span>±{alt.snapshot.accuracy_m}m</span>

                      {/* Status badge */}
                      {alt.status === 'ACKNOWLEDGED' && (
                        <span className="text-[9px] font-bold px-1 rounded"
                          style={{ background: '#1e3a5f', color: '#60a5fa' }}>ACK</span>
                      )}
                      {alt.status === 'RESOLVED' && (
                        <span className="text-[9px] font-bold px-1 rounded"
                          style={{ background: '#052e16', color: '#34d399' }}>RESOLVED</span>
                      )}
                    </div>

                    {isOpen ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); onAcknowledgeAlert(alt.id); }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all"
                        style={{ background: '#1e40af', color: '#fff' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#2563eb')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#1e40af')}>
                        <Check className="w-3 h-3" />
                        <span>ACK</span>
                      </button>
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" style={{ color: '#334155' }} />
                    )}
                  </div>
                </div>
              );
            })
          )
        ) : (
          /* Zone Overview — shows count per jurisdiction without exact locations */
          <div className="space-y-3">
            {/* Total count card */}
            <div className="rounded-xl p-4 text-center"
              style={{ background: 'linear-gradient(135deg, #0a1628, #0f2040)', border: '1px solid #1e3a5f' }}>
              <div className="text-3xl font-black font-mono text-white mb-1">{trips.length}</div>
              <div className="text-xs font-semibold" style={{ color: '#64748b' }}>Total Users in Jurisdiction</div>
              <div className="text-[10px] mt-1" style={{ color: '#334155' }}>
                📍 Location tracking is privacy-protected
              </div>
            </div>

            {/* Per-station breakdown */}
            {Object.entries(stationGroups).map(([id, station]) => (
              <div key={id} className="rounded-xl p-3"
                style={{
                  background: station.alertCount > 0 ? '#450a0a20' : '#0a1628',
                  border: `1px solid ${station.alertCount > 0 ? '#7f1d1d' : '#0f2040'}`,
                }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" style={{ color: station.alertCount > 0 ? '#f87171' : '#38bdf8' }} />
                    <span className="text-xs font-bold text-white truncate max-w-[160px]">{station.name}</span>
                  </div>
                  {station.alertCount > 0 && (
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse"
                      style={{ background: '#ef4444', color: '#fff' }}>
                      {station.alertCount} ALERT
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Users className="w-3.5 h-3.5" style={{ color: '#38bdf8' }} />
                    <span className="font-mono font-bold text-white">{station.count}</span>
                    <span style={{ color: '#475569' }}>users in zone</span>
                  </div>
                  {/* Progress bar */}
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#050d1a' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (station.count / Math.max(trips.length, 1)) * 100)}%`,
                        background: station.alertCount > 0 ? '#ef4444' : '#3b82f6',
                      }} />
                  </div>
                </div>
              </div>
            ))}

            {Object.keys(stationGroups).length === 0 && (
              <div className="text-center py-10" style={{ color: '#334155' }}>
                <Car className="w-8 h-8 mx-auto mb-2" style={{ color: '#1e3a5f' }} />
                <div className="text-xs">No active trips in jurisdiction</div>
              </div>
            )}

            {/* Privacy notice */}
            <div className="rounded-xl p-3 text-center"
              style={{ background: '#050d1a', border: '1px solid #0f2040' }}>
              <div className="text-[10px] font-semibold mb-1" style={{ color: '#334155' }}>
                🔒 Privacy Mode Active
              </div>
              <div className="text-[10px]" style={{ color: '#1e3a5f' }}>
                Exact GPS locations are only revealed when an SOS or safety alert is raised
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
