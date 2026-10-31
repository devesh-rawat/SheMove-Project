'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Clock, CheckCircle2, AlertCircle, Radio } from 'lucide-react';
import { Checkin, TripStatus } from '@/lib/types';

interface TravellerCheckinStatusProps {
  travellerFirstName: string;
  tripStatus: TripStatus;
  checkins: Checkin[];
  nextCheckinDueAt?: string;
  checkinDeadlineAt?: string;
}

export const TravellerCheckinStatus: React.FC<TravellerCheckinStatusProps> = ({
  travellerFirstName,
  tripStatus,
  checkins,
  nextCheckinDueAt,
  checkinDeadlineAt,
}) => {
  const [secondsUntilNext, setSecondsUntilNext] = useState<number>(0);
  const [deadlineSeconds, setDeadlineSeconds] = useState<number>(0);

  const isCheckinPending = tripStatus === 'CHECKIN_PENDING';
  const isEmergency = tripStatus === 'ALERT_RAISED';

  useEffect(() => {
    const updateCountdown = () => {
      if (isCheckinPending && checkinDeadlineAt) {
        const diff = Math.max(0, Math.floor((new Date(checkinDeadlineAt).getTime() - Date.now()) / 1000));
        setDeadlineSeconds(diff);
      } else if (nextCheckinDueAt) {
        const diff = Math.max(0, Math.floor((new Date(nextCheckinDueAt).getTime() - Date.now()) / 1000));
        setSecondsUntilNext(diff);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextCheckinDueAt, checkinDeadlineAt, isCheckinPending]);

  const latestCheckin = checkins.length > 0 ? checkins[0] : null;

  const formatCountdown = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="w-full rounded-3xl wireframe-border bg-zinc-950/80 p-4 relative select-none my-2 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center wireframe-border ${
              isEmergency
                ? 'bg-red-950 text-red-400 border-red-700'
                : isCheckinPending
                ? 'bg-amber-950 text-amber-300 border-amber-600 animate-pulse'
                : 'bg-emerald-950 text-emerald-400 border-emerald-700'
            }`}
          >
            {isEmergency ? (
              <ShieldAlert className="w-4 h-4" />
            ) : isCheckinPending ? (
              <Radio className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="font-sketch text-lg font-bold text-white leading-tight">
              safety check-in status
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">
              Pomodoro safety pings (every 5 min)
            </div>
          </div>
        </div>

        <span
          className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
            isEmergency
              ? 'bg-red-950 text-red-300 border border-red-800'
              : isCheckinPending
              ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
          }`}
        >
          {isCheckinPending ? 'Ping Active' : isEmergency ? 'Escalated' : 'Normal'}
        </span>
      </div>

      {/* Main Status Display */}
      {isCheckinPending ? (
        <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-700/60 mb-3 text-center">
          <div className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5">
            <Radio className="w-4 h-4 animate-ping text-amber-400" />
            <span>Safety check-in active on {travellerFirstName}'s phone</span>
          </div>
          <p className="text-[11px] text-amber-200/80 mt-1">
            Prompted: "Are you feeling Safe & comfortable?"
          </p>
          <div className="font-mono text-sm font-extrabold text-amber-400 mt-1">
            {deadlineSeconds > 0 ? `${deadlineSeconds}s response window left` : 'Escalating...'}
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800 mb-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-zinc-400">
              Traveller Status
            </div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {latestCheckin?.response === 'SAFE'
                  ? 'Confirmed Safe & Comfortable'
                  : 'Journey Normal'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase font-semibold text-zinc-400">
              Next Check-in Ping
            </div>
            <div className="text-xs font-mono font-bold text-white mt-0.5">
              {secondsUntilNext > 0 ? `in ~${formatCountdown(secondsUntilNext)}` : 'Imminent'}
            </div>
          </div>
        </div>
      )}

      {/* Check-ins Timeline */}
      {checkins.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase font-mono font-semibold text-zinc-400 px-1">
            Recent Check-in Timeline
          </div>
          {checkins.slice(0, 3).map((chk) => (
            <div
              key={chk.id}
              className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    chk.outcome === 'OK'
                      ? 'bg-emerald-400'
                      : chk.outcome === 'PENDING'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-red-500'
                  }`}
                />
                <span className="font-mono text-zinc-300 text-[11px]">
                  Check-in #{chk.sequence}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {new Date(chk.asked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <span
                className={`font-mono text-[11px] font-bold ${
                  chk.outcome === 'OK'
                    ? 'text-emerald-400'
                    : chk.outcome === 'PENDING'
                    ? 'text-amber-300'
                    : 'text-red-400'
                }`}
              >
                {chk.response === 'SAFE'
                  ? 'Confirmed Safe'
                  : chk.response === 'UNSAFE'
                  ? 'Reported Unsafe'
                  : chk.outcome}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
