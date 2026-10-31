'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Check, X, ArrowRight, ArrowLeft } from 'lucide-react';

interface SafetyCheckinCardProps {
  checkinDeadline?: string;
  onRespond: (response: 'SAFE' | 'UNSAFE') => Promise<void>;
  isSubmitting?: boolean;
}

export const SafetyCheckinCard: React.FC<SafetyCheckinCardProps> = ({
  checkinDeadline,
  onRespond,
  isSubmitting = false,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(45);

  useEffect(() => {
    if (!checkinDeadline) {
      setSecondsLeft(45);
      return;
    }

    const updateTimer = () => {
      const deadline = new Date(checkinDeadline).getTime();
      const diff = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setSecondsLeft(diff > 0 ? diff : 45); // default fallback
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [checkinDeadline]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

  // SVG circular geometry for the check-in timer
  const size = 180;
  const strokeWidth = 6;
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const maxWindow = 60; // 60s window
  const fraction = Math.min(1, Math.max(0, secondsLeft / maxWindow));
  const strokeDashoffset = circumference * (1 - fraction);

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-3xl wireframe-border bg-black/40 backdrop-blur-md relative select-none w-full max-w-sm mx-auto my-2 transition-all">
      {/* Header matching image: "Answer in 1 min" */}
      <div className="font-sketch text-xl sm:text-2xl text-amber-300 font-bold tracking-wide text-center mb-1">
        Answer in 1 min
      </div>

      {/* Circular Gauge matching left screen in sketch */}
      <div className="relative flex items-center justify-center my-2">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#f59e0b"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
          {/* Inner ring */}
          <circle
            cx={center}
            cy={center}
            r={radius - 8}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-3xl font-extrabold text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">
            {formattedTime}
          </span>
          <span className="text-[10px] uppercase font-semibold text-zinc-400 mt-0.5">
            Pomodoro Ping
          </span>
        </div>
      </div>

      {/* Card matching sketch: "Are you feeling Safe & comfortable" */}
      <div className="w-full py-3 px-4 rounded-2xl wireframe-border bg-zinc-900/80 text-center my-2 shadow-inner">
        <p className="font-sketch text-xl sm:text-2xl text-white font-bold leading-snug">
          Are you feeling
          <br />
          <span className="text-emerald-400">Safe & comfortable</span>
        </p>
      </div>

      {/* Dual slider / tactile action matching sketch: (yes) >>  and  << (no) */}
      <div className="w-full grid grid-cols-2 gap-2 mt-2">
        {/* Left Action: (yes) >> */}
        <button
          onClick={() => onRespond('SAFE')}
          disabled={isSubmitting}
          className="flex items-center justify-between px-3 py-2.5 rounded-full wireframe-border bg-emerald-950/60 hover:bg-emerald-900/80 active:scale-95 transition-all text-emerald-300 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full border border-emerald-400/80 flex items-center justify-center font-sketch text-sm font-bold bg-emerald-900/60 text-white shadow">
            yes
          </div>
          <div className="flex items-center text-emerald-400 font-bold text-xs tracking-widest group-hover:translate-x-1 transition-transform">
            <span>&gt;&gt;</span>
          </div>
        </button>

        {/* Right Action: << (no) */}
        <button
          onClick={() => onRespond('UNSAFE')}
          disabled={isSubmitting}
          className="flex items-center justify-between px-3 py-2.5 rounded-full wireframe-border bg-red-950/60 hover:bg-red-900/80 active:scale-95 transition-all text-red-300 group cursor-pointer"
        >
          <div className="flex items-center text-red-400 font-bold text-xs tracking-widest group-hover:-translate-x-1 transition-transform">
            <span>&lt;&lt;</span>
          </div>
          <div className="w-8 h-8 rounded-full border border-red-400/80 flex items-center justify-center font-sketch text-sm font-bold bg-red-900/60 text-white shadow">
            no
          </div>
        </button>
      </div>

      <div className="text-[10px] text-zinc-400 font-sketch text-center mt-2">
        Tap "yes" to confirm safety, or "no" to dispatch immediate emergency alert.
      </div>
    </div>
  );
};
