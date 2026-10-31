'use client';

import React, { useState } from 'react';
import {
  X,
  PlayCircle,
  Siren,
  Clock,
  WifiOff,
  CheckCircle,
  Footprints,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import { soundManager } from '@/lib/sound';

interface DemoSimulationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulate: (action: string) => Promise<void>;
}

export const DemoSimulationDrawer: React.FC<DemoSimulationDrawerProps> = ({
  isOpen,
  onClose,
  onSimulate,
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [lastExecuted, setLastExecuted] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAction = async (action: string, soundEffect?: () => void) => {
    try {
      setLoadingAction(action);
      if (soundEffect) soundEffect();
      await onSimulate(action);
      setLastExecuted(action);
    } catch (err) {
      console.error('Simulation error', err);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-700 h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <div className="font-bold text-white text-sm">Demo Simulation Controller</div>
              <div className="text-[11px] text-slate-400">Trigger Section 18 Hackathon Scenarios</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          <div className="bg-amber-950/30 border border-amber-600/50 rounded-lg p-2.5 text-amber-200 text-[11px] flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              Use these triggers to instantly demonstrate the state machine transitions, server watchdog, and automatic escalation pathways.
            </div>
          </div>

          {/* Scenario 1: Critical SOS */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 hover:border-red-500/60 transition">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Siren className="w-4 h-4 text-red-400" />
                <span>1. Trigger CRITICAL SOS Alert</span>
              </span>
              <span className="bg-red-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded uppercase">
                CRITICAL
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mb-2.5">
              Simulates traveller pressing the panic button or duress PIN. Immediately raises emergency alert, sounds siren, and flags location.
            </p>
            <button
              onClick={() => handleAction('sos', () => soundManager.playCriticalAlertSiren())}
              disabled={loadingAction === 'sos'}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow transition disabled:opacity-50"
            >
              {loadingAction === 'sos' ? 'Triggering...' : 'Emit Emergency SOS'}
            </button>
          </div>

          {/* Scenario 2: Missed Pomodoro Check-in */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 hover:border-amber-500/60 transition">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>2. Simulate Missed Check-in</span>
              </span>
              <span className="bg-amber-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded uppercase">
                HIGH
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mb-2.5">
              Simulates safety pomodoro timer expiring with no traveller response within the grace window. Triggers automated escalation.
            </p>
            <button
              onClick={() => handleAction('missed_checkin', () => soundManager.playHighAlertBeep())}
              disabled={loadingAction === 'missed_checkin'}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded shadow transition disabled:opacity-50"
            >
              {loadingAction === 'missed_checkin' ? 'Triggering...' : 'Simulate Missed Check-in'}
            </button>
          </div>

          {/* Scenario 3: Phone Dead / Heartbeat Silence */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 hover:border-rose-500/60 transition">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <WifiOff className="w-4 h-4 text-rose-400" />
                <span>3. Kill Heartbeat (Dead / Switched Off)</span>
              </span>
              <span className="bg-rose-700 text-white font-black text-[9px] px-1.5 py-0.2 rounded uppercase">
                SERVER WATCHDOG
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mb-2.5">
              Tests the server-side dead-man's switch: phone stops sending pings. Server raises PHONE_UNREACHABLE using the last stored location and battery %.
            </p>
            <button
              onClick={() => handleAction('kill_heartbeat', () => soundManager.playHighAlertBeep())}
              disabled={loadingAction === 'kill_heartbeat'}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded shadow transition disabled:opacity-50"
            >
              {loadingAction === 'kill_heartbeat' ? 'Triggering...' : 'Kill Heartbeat Ping'}
            </button>
          </div>

          {/* Scenario 4: Safe Check-in Response */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 hover:border-emerald-500/60 transition">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>4. Safe Check-in Answer</span>
              </span>
              <span className="bg-emerald-700 text-white font-black text-[9px] px-1.5 py-0.2 rounded uppercase">
                SAFE
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mb-2.5">
              Traveller answers "Yes, I'm safe and comfortable". Reschedules the next 5-minute pomodoro check-in.
            </p>
            <button
              onClick={() => handleAction('safe_checkin', () => soundManager.playAcknowledgeChime())}
              disabled={loadingAction === 'safe_checkin'}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded shadow transition disabled:opacity-50"
            >
              {loadingAction === 'safe_checkin' ? 'Responding...' : 'Answer "Safe"'}
            </button>
          </div>

          {/* Scenario 5: Step GPS Forward */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 hover:border-blue-500/60 transition">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-blue-400" />
                <span>5. Advance Live GPS Location</span>
              </span>
              <span className="bg-blue-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded uppercase">
                TELEMETRY
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mb-2.5">
              Advances traveller position by ~150 meters, updates speed and breadcrumb trail on the map.
            </p>
            <button
              onClick={() => handleAction('advance_location')}
              disabled={loadingAction === 'advance_location'}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow transition disabled:opacity-50"
            >
              {loadingAction === 'advance_location' ? 'Stepping...' : 'Step Location Forward (+150m)'}
            </button>
          </div>

          {/* Scenario 6: Reached Safely */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 hover:border-purple-500/60 transition">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-purple-400" />
                <span>6. Mark Trip "Reached Safely"</span>
              </span>
              <span className="bg-purple-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded uppercase">
                COMPLETED
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mb-2.5">
              Concludes the journey, dispatches "Reached safely" SMS to contacts, and archives the trip.
            </p>
            <button
              onClick={() => handleAction('complete_trip', () => soundManager.playAcknowledgeChime())}
              disabled={loadingAction === 'complete_trip'}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded shadow transition disabled:opacity-50"
            >
              {loadingAction === 'complete_trip' ? 'Completing...' : 'Mark Reached Safely'}
            </button>
          </div>

          {/* Scenario 7: Reset / Re-seed */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => handleAction('seed')}
              disabled={loadingAction === 'seed'}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-md border border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset & Re-seed All Demo Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
