'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, MapPin, Lock } from 'lucide-react';

interface ReachedSafelyBannerProps {
  travellerName: string;
  completedAt?: string;
  destinationName?: string;
}

export const ReachedSafelyBanner: React.FC<ReachedSafelyBannerProps> = ({
  travellerName,
  completedAt,
  destinationName,
}) => {
  const formattedTime = completedAt
    ? new Date(completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="w-full bg-emerald-950/90 border-2 border-emerald-600 rounded-3xl p-5 text-center text-white my-3 shadow-2xl relative overflow-hidden select-none animate-in zoom-in-95 duration-300">
      <div className="w-14 h-14 rounded-full bg-emerald-900/80 border border-emerald-400 flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <h3 className="font-sketch text-2xl sm:text-3xl font-bold text-white mb-1">
        {travellerName} has reached safely!
      </h3>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700 text-xs font-mono text-emerald-300 mb-3">
        <span>Arrival confirmed at {formattedTime}</span>
      </div>

      {destinationName && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-300 mb-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>Destination: {destinationName}</span>
        </div>
      )}

      <div className="pt-3 border-t border-emerald-800/80 flex items-center justify-center gap-2 text-[11px] text-zinc-400">
        <Lock className="w-3.5 h-3.5 text-zinc-400" />
        <span>Location streaming terminated for traveller privacy protection.</span>
      </div>
    </div>
  );
};
