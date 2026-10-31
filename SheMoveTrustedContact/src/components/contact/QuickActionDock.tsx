'use client';

import React, { useState } from 'react';
import { Phone, PhoneCall, ShieldAlert, Share2, Building2, Check, ExternalLink } from 'lucide-react';

interface QuickActionDockProps {
  travellerPhone: string;
  travellerName: string;
  stationName: string;
  onOpenStationInfo: () => void;
  isEmergency?: boolean;
}

export const QuickActionDock: React.FC<QuickActionDockProps> = ({
  travellerPhone,
  travellerName,
  stationName,
  onOpenStationInfo,
  isEmergency = false,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const travellerFirstName = travellerName.split(' ')[0] || 'Traveller';

  return (
    <div className="flex flex-col items-center justify-center my-3 select-none w-full">
      {/* Label matching the user's sketch */}
      <div className="font-sketch text-base sm:text-lg text-zinc-400 mb-2 flex items-center gap-1.5">
        <span>contacts and police</span>
        {copiedLink && (
          <span className="text-emerald-400 text-xs font-mono font-bold animate-in fade-in">
            (Link Copied!)
          </span>
        )}
      </div>

      {/* 4 Circular Buttons matching the sketch */}
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {/* 1. Call Traveller */}
        <a
          href={`tel:${travellerPhone}`}
          title={`Call ${travellerFirstName}`}
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full wireframe-border bg-zinc-900/90 hover:bg-zinc-800 active:scale-95 flex flex-col items-center justify-center text-white transition-all shadow-lg group relative cursor-pointer"
        >
          <Phone className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] text-zinc-400 font-sans mt-0.5 truncate max-w-[44px]">
            {travellerFirstName}
          </span>
        </a>

        {/* 2. Call Police 112 */}
        <a
          href="tel:112"
          title="Call Police Emergency (112)"
          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full wireframe-border active:scale-95 flex flex-col items-center justify-center text-white transition-all shadow-lg group relative cursor-pointer ${
            isEmergency
              ? 'bg-red-600 border-white animate-bounce'
              : 'bg-zinc-900/90 hover:bg-red-950/70 border-red-500/50'
          }`}
        >
          <ShieldAlert className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] text-red-300 font-bold font-sans mt-0.5">
            112
          </span>
        </a>

        {/* 3. Share Tracking Link */}
        <button
          onClick={handleShare}
          title="Share Tracking Link via WhatsApp or Copy"
          type="button"
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full wireframe-border bg-zinc-900/90 hover:bg-zinc-800 active:scale-95 flex flex-col items-center justify-center text-white transition-all shadow-lg group relative cursor-pointer"
        >
          {copiedLink ? (
            <Check className="w-5 h-5 text-emerald-400" />
          ) : (
            <Share2 className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-[9px] text-zinc-400 font-sans mt-0.5">
            {copiedLink ? 'Copied' : 'Share'}
          </span>
        </button>

        {/* 4. Station & CAD Info */}
        <button
          onClick={onOpenStationInfo}
          title={`Jurisdiction: ${stationName}`}
          type="button"
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full wireframe-border bg-zinc-900/90 hover:bg-zinc-800 active:scale-95 flex flex-col items-center justify-center text-white transition-all shadow-lg group relative cursor-pointer"
        >
          <Building2 className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] text-zinc-400 font-sans mt-0.5">
            Police
          </span>
        </button>
      </div>
    </div>
  );
};
