'use client';

import React from 'react';
import { X, Building2, Phone, ShieldCheck, MapPin, Radio, Car } from 'lucide-react';

interface PoliceStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationName: string;
  stationPhone?: string;
  dispatchInfo?: {
    dispatched_at: string;
    unit_callsign: string;
    officer_in_charge: string;
    eta_minutes: number;
    notes: string;
  } | null;
}

export const PoliceStationModal: React.FC<PoliceStationModalProps> = ({
  isOpen,
  onClose,
  stationName,
  stationPhone = '+91-11-2334-0120',
  dispatchInfo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-sm rounded-3xl wireframe-border bg-zinc-950 p-5 shadow-2xl relative text-white border border-white/30">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="w-12 h-12 rounded-full wireframe-border bg-blue-950/60 border-blue-500/50 flex items-center justify-center mx-auto mb-2 text-blue-400">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="font-sketch text-2xl font-bold tracking-wide text-white">
            jurisdiction station
          </h3>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            PostGIS Automated CAD Jurisdiction
          </p>
        </div>

        <div className="space-y-3 mb-4">
          <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className="text-[10px] uppercase font-semibold text-zinc-400">
              Station Name
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              {stationName}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-semibold text-zinc-400">
                Direct Police Control Room
              </div>
              <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                {stationPhone}
              </div>
            </div>
            <a
              href={`tel:${stationPhone}`}
              className="p-2 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition flex items-center gap-1 text-xs font-bold"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          </div>

          {/* Active Emergency Dispatch Unit Info if dispatched */}
          {dispatchInfo && (
            <div className="p-3 rounded-2xl bg-red-950/40 border border-red-800 text-xs">
              <div className="flex items-center gap-1.5 text-red-400 font-bold mb-1">
                <Car className="w-4 h-4 animate-pulse" />
                <span>Patrol Unit En Route</span>
              </div>
              <div className="text-zinc-300">
                Callsign: <span className="font-mono font-bold text-white">{dispatchInfo.unit_callsign}</span>
              </div>
              <div className="text-zinc-300">
                Officer: <span className="font-semibold text-white">{dispatchInfo.officer_in_charge}</span>
              </div>
              <div className="text-amber-300 font-mono font-bold mt-1">
                ETA: ~{dispatchInfo.eta_minutes} mins
              </div>
            </div>
          )}

          <div className="p-2.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              Real-time PostGIS polygon lookup automatically connects alerts from this journey to the nearest station house officer.
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          type="button"
          className="w-full py-2.5 rounded-2xl wireframe-border font-sketch text-lg font-bold text-white hover:bg-zinc-900 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};
