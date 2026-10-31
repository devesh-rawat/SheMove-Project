'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  PlayCircle,
  LogOut,
  ChevronDown,
  Activity,
  AlertTriangle,
  Clock,
  Users,
  BellRing,
  Wifi,
  Shield,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { PoliceDashboardStats, PoliceOfficer, PoliceStation } from '@/lib/types';
import { soundManager } from '@/lib/sound';

interface PoliceHeaderProps {
  currentOfficer: PoliceOfficer;
  stations: PoliceStation[];
  selectedStationId: string;
  onSelectStation: (stationId: string) => void;
  stats: PoliceDashboardStats;
  onOpenDemoDrawer: () => void;
  onLogout: () => void;
}

export const PoliceHeader: React.FC<PoliceHeaderProps> = ({
  currentOfficer,
  stations,
  selectedStationId,
  onSelectStation,
  stats,
  onOpenDemoDrawer,
  onLogout,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [showOfficerMenu, setShowOfficerMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSound = () => {
    const nextMuted = soundManager.toggleMuted();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundManager.playAcknowledgeChime();
    }
  };

  const hasCritical = stats.criticalAlertsCount > 0;

  return (
    <header className="police-header relative bg-[#060b14]/95 border-b border-[#1a2744]/80 text-white flex items-center justify-between gap-3 px-5 py-0 shadow-2xl select-none overflow-hidden"
      style={{ height: '58px', backdropFilter: 'blur(20px)' }}>
      
      {/* Animated glow line at top */}
      <div className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: hasCritical 
          ? 'linear-gradient(90deg, transparent, #ef4444 30%, #ef4444 70%, transparent)' 
          : 'linear-gradient(90deg, transparent, #3b82f6 30%, #60a5fa 70%, transparent)',
          boxShadow: hasCritical ? '0 0 20px #ef444466' : '0 0 20px #3b82f644'
        }} />

      {/* Left: Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl shadow-xl"
          style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 0 20px #ef444450' }}>
          <ShieldAlert className="w-5 h-5 text-white" />
          {hasCritical && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide"
              style={{ fontFamily: "'Outfit', sans-serif", background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SafeJourney CAD
            </span>
            <span className="text-[9px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded-md"
              style={{ background: '#ef444420', color: '#f87171', border: '1px solid #ef444440' }}>
              Police 112
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: '#64748b' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live CAD</span>
            <span>•</span>
            <span className="font-mono" style={{ color: '#475569' }}>
              {currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Live Stats Strip */}
      <div className="flex items-center gap-2 flex-1 justify-center">
        {/* Users in Jurisdiction */}
        <div className="stat-chip flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
          style={{ background: '#0f172a', border: '1px solid #1e3a5f' }}>
          <Users className="w-3.5 h-3.5" style={{ color: '#38bdf8' }} />
          <span style={{ color: '#64748b' }}>In Zone</span>
          <span className="font-bold font-mono text-white">{stats.activeTripsCount}</span>
        </div>

        {/* Open Alerts */}
        <div className="stat-chip flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{
            background: hasCritical ? '#450a0a' : stats.openAlertsCount > 0 ? '#431407' : '#0f172a',
            border: `1px solid ${hasCritical ? '#7f1d1d' : stats.openAlertsCount > 0 ? '#78350f' : '#1e3a5f'}`,
            animation: hasCritical ? 'criticalPulse 1.5s ease-in-out infinite' : 'none'
          }}>
          <AlertTriangle className="w-3.5 h-3.5" style={{ color: hasCritical ? '#f87171' : '#fb923c' }} />
          <span style={{ color: '#64748b' }}>Alerts</span>
          <span className="font-bold font-mono text-white">{stats.openAlertsCount}</span>
          {hasCritical && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded"
              style={{ background: '#ef4444', color: '#fff' }}>
              {stats.criticalAlertsCount} CRIT
            </span>
          )}
        </div>

        {/* Resolved Today */}
        <div className="stat-chip flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hidden md:flex"
          style={{ background: '#0f172a', border: '1px solid #1e3a5f' }}>
          <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#34d399' }} />
          <span style={{ color: '#64748b' }}>Resolved</span>
          <span className="font-bold font-mono text-white">{stats.resolvedTodayCount}</span>
        </div>

        {/* Avg Ack Time */}
        <div className="stat-chip flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hidden lg:flex"
          style={{ background: '#0f172a', border: '1px solid #1e3a5f' }}>
          <Clock className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />
          <span style={{ color: '#64748b' }}>Avg Ack</span>
          <span className="font-bold font-mono text-white">
            {stats.avgAckTimeSeconds < 60 ? `${stats.avgAckTimeSeconds}s` : `${Math.floor(stats.avgAckTimeSeconds / 60)}m`}
          </span>
        </div>

        {/* Station Selector */}
        <div className="relative hidden sm:block">
          <select
            value={selectedStationId}
            onChange={(e) => onSelectStation(e.target.value)}
            className="appearance-none pr-7 pl-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none cursor-pointer transition"
            style={{
              background: '#0f172a',
              border: '1px solid #1e3a5f',
              color: '#e2e8f0',
            }}>
            <option value="all">All Jurisdictions</option>
            {stations.map((st) => (
              <option key={st.id} value={st.id}>{st.name} ({st.code})</option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }} />
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          title={isMuted ? 'Enable sirens' : 'Mute'}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: isMuted ? '#0f172a' : '#172554',
            border: `1px solid ${isMuted ? '#1e3a5f' : '#1e40af'}`,
            color: isMuted ? '#475569' : '#93c5fd'
          }}>
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 animate-pulse" />}
          <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Live'}</span>
        </button>

        {/* Test Siren */}
        <button
          onClick={() => soundManager.playCriticalAlertSiren()}
          title="Test siren"
          className="p-1.5 rounded-lg transition-all"
          style={{ background: '#0f172a', border: '1px solid #1e3a5f', color: '#fbbf24' }}>
          <BellRing className="w-3.5 h-3.5" />
        </button>

        {/* Demo Controls */}
        <button
          onClick={onOpenDemoDrawer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all"
          style={{
            background: 'linear-gradient(135deg, #d97706, #b45309)',
            border: '1px solid #d9770660',
            color: '#fff',
            boxShadow: '0 0 15px #d9770630'
          }}>
          <PlayCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Demo</span>
        </button>

        {/* Officer Profile */}
        <div className="relative">
          <button
            onClick={() => setShowOfficerMenu(!showOfficerMenu)}
            className="flex items-center gap-2 rounded-lg px-2 py-1 transition-all"
            style={{ background: '#0f172a', border: '1px solid #1e3a5f' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-[11px]"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff' }}>
              {currentOfficer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold leading-tight truncate max-w-[100px]" style={{ color: '#e2e8f0' }}>
                {currentOfficer.name.split(' ')[0]}
              </div>
              <div className="text-[9px]" style={{ color: '#475569' }}>{currentOfficer.rank}</div>
            </div>
            <ChevronDown className="w-3 h-3" style={{ color: '#475569' }} />
          </button>

          {showOfficerMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl z-50 overflow-hidden"
              style={{ background: '#0a0f1e', border: '1px solid #1e3a5f', backdropFilter: 'blur(20px)' }}>
              <div className="p-4 border-b" style={{ borderColor: '#1e3a5f' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff' }}>
                    {currentOfficer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">{currentOfficer.name}</div>
                    <div className="text-xs" style={{ color: '#64748b' }}>{currentOfficer.rank}</div>
                    <div className="text-[11px] font-mono mt-0.5" style={{ color: '#3b82f6' }}>
                      Badge #{currentOfficer.badgeNumber}
                    </div>
                  </div>
                </div>
                <div className="text-[11px] mt-2 px-1" style={{ color: '#475569' }}>{currentOfficer.stationName}</div>
              </div>
              <button
                onClick={() => { setShowOfficerMenu(false); onLogout(); }}
                className="w-full text-left px-4 py-3 flex items-center gap-2.5 text-xs font-semibold transition-all"
                style={{ color: '#f87171' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#450a0a')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <LogOut className="w-4 h-4" />
                <span>Switch Officer / Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
