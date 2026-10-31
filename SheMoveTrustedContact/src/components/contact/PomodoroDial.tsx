'use client';

import React from 'react';

interface PomodoroDialProps {
  remainingSeconds: number;
  totalDurationSeconds: number;
  subtitle?: string;
  isEmergency?: boolean;
  isCheckinPending?: boolean;
}

export const PomodoroDial: React.FC<PomodoroDialProps> = ({
  remainingSeconds,
  totalDurationSeconds,
  subtitle,
  isEmergency = false,
  isCheckinPending = false,
}) => {
  // Format remaining time to minutes:seconds
  const safeSeconds = Math.max(0, Math.floor(remainingSeconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  const formattedMinutes = mins < 10 ? `0${mins}` : `${mins}`;
  const formattedSeconds = secs < 10 ? `0${secs}` : `${secs}`;

  // Progress percentage (0 to 1)
  const total = Math.max(1, totalDurationSeconds);
  const fraction = Math.min(1, Math.max(0, safeSeconds / total));

  // SVG Geometry
  const size = 260;
  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - fraction);

  // Generate tick marks for 12 positions around the clock
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    const isCardinal = i % 3 === 0; // 12, 3, 6, 9 o'clock
    const tickLength = isCardinal ? 14 : 7;
    const innerR = radius - 18;
    const outerR = innerR - tickLength;

    const x1 = center + innerR * Math.sin(angle);
    const y1 = center - innerR * Math.cos(angle);
    const x2 = center + outerR * Math.sin(angle);
    const y2 = center - outerR * Math.cos(angle);

    return { i, x1, y1, x2, y2, isCardinal };
  });

  // Calculate clock hand angle
  const handAngle = (1 - fraction) * 360;
  const handRad = (handAngle * Math.PI) / 180;
  const handLength = radius - 30;
  const handX = center + handLength * Math.sin(handRad);
  const handY = center - handLength * Math.cos(handRad);

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      {/* Top planned trip label matching the image sketch */}
      <div className="font-sketch text-lg sm:text-xl text-zinc-300 tracking-wide mb-2 text-center flex items-center gap-1.5">
        <span>{subtitle || 'trip planned for 3.5 hrs'}</span>
      </div>

      {/* Main Circular Clock / Gauge */}
      <div className="relative flex items-center justify-center">
        {/* Outer Wireframe Ring Glow */}
        <div
          className={`absolute rounded-full transition-all duration-700 ${
            isEmergency
              ? 'w-68 h-68 border-2 border-red-500/80 shadow-[0_0_35px_rgba(239,68,68,0.35)] animate-pulse'
              : isCheckinPending
              ? 'w-68 h-68 border-2 border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.25)]'
              : 'w-68 h-68 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.06)]'
          }`}
        />

        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth={strokeWidth}
          />

          {/* Active Progress Countdown Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={
              isEmergency
                ? '#ef4444'
                : isCheckinPending
                ? '#f59e0b'
                : 'rgba(255, 255, 255, 0.85)'
            }
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />

          {/* Inner Decorative Chalk Wireframe Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius - 12}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />

          {/* Clock Ticks at 12, 3, 6, 9 and intermediate hours */}
          <g className="transform rotate-90 origin-center">
            {ticks.map((t) => (
              <line
                key={t.i}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                className={t.isCardinal ? 'dial-tick-cardinal' : 'dial-tick'}
              />
            ))}

            {/* Sweep Clock Hand Pointer */}
            <line
              x1={center}
              y1={center}
              x2={handX}
              y2={handY}
              stroke={isEmergency ? '#ef4444' : 'rgba(255, 255, 255, 0.7)'}
              strokeWidth={2}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
            <circle
              cx={center}
              cy={center}
              r={4}
              fill={isEmergency ? '#ef4444' : 'white'}
            />
          </g>
        </svg>

        {/* Center Digital Display matching sketch */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="font-sketch text-xs sm:text-sm text-zinc-400 tracking-wider">
            mins : secs
          </span>
          <div
            className={`font-mono text-3xl sm:text-4xl font-extrabold tracking-tight transition-colors ${
              isEmergency
                ? 'text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                : isCheckinPending
                ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]'
            }`}
          >
            {formattedMinutes}:{formattedSeconds}
          </div>
          {isEmergency && (
            <span className="text-[10px] uppercase font-bold text-red-400 tracking-widest mt-1 bg-red-950/80 px-2 py-0.5 rounded-full border border-red-800">
              Emergency Active
            </span>
          )}
          {isCheckinPending && !isEmergency && (
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-widest mt-1 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800 animate-pulse">
              Check-In Pending
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
