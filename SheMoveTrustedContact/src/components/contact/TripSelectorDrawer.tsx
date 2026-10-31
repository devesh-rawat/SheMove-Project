'use client';

import React, { useState } from 'react';
import { Trip } from '@/lib/types';
import {
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Play,
  RotateCcw,
  Zap,
  BatteryMedium,
  CheckCircle,
  Copy,
  Check
} from 'lucide-react';

interface TripSelectorDrawerProps {
  currentTrip: Trip;
  allTrips: Trip[];
  onSelectTrip: (trip: Trip) => void;
  onSimulateAction: (action: string) => Promise<void>;
  isSimulating: boolean;
}

export const TripSelectorDrawer: React.FC<TripSelectorDrawerProps> = ({
  currentTrip,
  allTrips,
  onSelectTrip,
  onSimulateAction,
  isSimulating,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const copyShareLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/t/${currentTrip.share_token}`;
      navigator.clipboard.writeText(url);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="w-full bg-zinc-950/95 border-b border-zinc-800 text-white select-none z-30 transition-all">
      {/* Collapsed Bar */}
      <div className="px-3 py-2 flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="flex items-center gap-2 text-left hover:text-white transition group"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{currentTrip.traveller_name}</span>
              <span className="text-[10px] text-zinc-400 font-normal">
                ({currentTrip.status.replace(/_/g, ' ')})
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
              <span>Switch Demo Trip / Scenarios</span>
              {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={copyShareLink}
            type="button"
            title="Copy share link"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[10px] font-mono text-zinc-300 border border-zinc-700 transition"
          >
            {copiedToken ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 text-zinc-400" />
            )}
            <span>{copiedToken ? 'Copied' : 'Link'}</span>
          </button>

          <button
            onClick={() => onSimulateAction('advance_location')}
            disabled={isSimulating}
            title="Move traveller forward along route"
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800 text-[10px] font-bold shadow transition active:scale-95"
          >
            <Play className="w-3 h-3" />
            <span>GPS+</span>
          </button>
        </div>
      </div>

      {/* Expanded Scenario Drawer */}
      {isOpen && (
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/95 animate-in slide-in-from-top-2 duration-200">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Select Active Journey Scenario</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            {allTrips.map((trip) => {
              const isSelected = trip.id === currentTrip.id;
              const hasAlert = trip.alerts.some(
                (a) => a.status === 'OPEN' || a.status === 'ACKNOWLEDGED'
              );
              return (
                <button
                  key={trip.id}
                  onClick={() => {
                    onSelectTrip(trip);
                    setIsOpen(false);
                  }}
                  type="button"
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-zinc-800 border-white/60 shadow-lg'
                      : 'bg-zinc-950/60 border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{trip.traveller_name}</span>
                      {hasAlert && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      Plate: {trip.vehicle_number || 'Awaiting'} • {trip.current_station_name.split(' - ')[0]}
                    </div>
                  </div>

                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded font-mono ${
                      trip.status === 'ALERT_RAISED'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : trip.status === 'COMPLETED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {trip.status.replace(/_/g, ' ')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Simulation Bar for Hackathon Demos */}
          <div className="pt-2 border-t border-zinc-800">
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">
              Instant Demo Simulation Triggers (Section 18)
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => onSimulateAction('safe_checkin')}
                disabled={isSimulating}
                type="button"
                className="py-1.5 px-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[10px] font-bold text-center transition"
              >
                Safe Check-In
              </button>
              <button
                onClick={() => onSimulateAction('sos')}
                disabled={isSimulating}
                type="button"
                className="py-1.5 px-2 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-[10px] font-bold text-center transition"
              >
                Trigger SOS
              </button>
              <button
                onClick={() => onSimulateAction('kill_heartbeat')}
                disabled={isSimulating}
                type="button"
                className="py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-800 text-[10px] font-bold text-center transition"
              >
                Kill Phone
              </button>
              <button
                onClick={() => onSimulateAction('complete_trip')}
                disabled={isSimulating}
                type="button"
                className="py-1.5 px-2 rounded-lg bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800 text-[10px] font-bold text-center transition"
              >
                Reach Safely
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
