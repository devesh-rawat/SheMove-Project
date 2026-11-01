'use client';

import React, { useState } from 'react';
import {
  COMMUNITY_SAFETY_ZONES,
  COMMUNITY_HEATMAP_STATS,
  SafetyHeatZone,
} from '@/lib/safetyHeatmapData';
import {
  ShieldCheck,
  AlertTriangle,
  Flame,
  X,
  Compass,
  MapPin,
  Eye,
  Info,
  Radio,
  Sparkles,
  ChevronRight,
  Sun,
  Moon,
  Layers,
} from 'lucide-react';

interface CommunityHeatmapDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onFlyToZone: (zone: SafetyHeatZone) => void;
  selectedZoneId?: string;
  isMapLightMode: boolean;
  onToggleMapLightMode: () => void;
}

export const CommunityHeatmapDrawer: React.FC<CommunityHeatmapDrawerProps> = ({
  isOpen,
  onClose,
  onFlyToZone,
  selectedZoneId,
  isMapLightMode,
  onToggleMapLightMode,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'SAFE' | 'CAUTION' | 'HIGH_RISK'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHowItWorks, setShowHowItWorks] = useState(true);

  if (!isOpen) return null;

  const filteredZones = COMMUNITY_SAFETY_ZONES.filter((z) => {
    if (filter === 'SAFE' && z.riskLevel !== 'SAFE') return false;
    if (filter === 'CAUTION' && z.riskLevel !== 'CAUTION' && z.riskLevel !== 'ELEVATED') return false;
    if (filter === 'HIGH_RISK' && z.riskLevel !== 'HIGH_RISK') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return z.name.toLowerCase().includes(q) || z.sector.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div
      className="fixed inset-y-0 right-0 z-[1200] w-full max-w-lg bg-white/95 text-slate-900 shadow-2xl border-l border-slate-200 backdrop-blur-xl flex flex-col transition-all duration-300 animate-in slide-in-from-right"
      style={{
        boxShadow: '-10px 0 40px rgba(15, 23, 42, 0.15)',
      }}
    >
      {/* ── Top Header (Light Mode) ────────────────────────── */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-100 border border-violet-200 text-violet-800 text-[10px] font-bold tracking-wider uppercase mb-1.5">
            <Flame className="w-3 h-3 text-violet-600" />
            <span>Community Intelligence</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Community-Driven Safety Heatmap
          </h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Aggregates anonymous, voluntary safety feedback from women to identify and visualize locations perceived as unsafe, generating dynamic red, orange and green safety zones for informed route planning.
          </p>
        </div>

        <div className="flex items-center gap-1.5 ml-2">
          {/* Map style toggle inside drawer */}
          <button
            onClick={onToggleMapLightMode}
            className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
              isMapLightMode
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
            title="Toggle Map Light/Dark Mode"
          >
            {isMapLightMode ? <Sun className="w-4 h-4 text-amber-600" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Scrollable Body ────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* ── How it works Card (Clean Light Porcelain) ────── */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-violet-600 text-white text-xs font-bold">
                i
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                How It Works
              </h3>
            </div>
            <button
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="text-[11px] font-semibold text-violet-700 hover:text-violet-900 underline"
            >
              {showHowItWorks ? 'Collapse' : 'Expand'}
            </button>
          </div>

          {showHowItWorks && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-100 text-violet-800 text-[11px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">User Feedback</h4>
                  <p className="text-[11px] text-slate-600">Women anonymously report areas where they feel unsafe.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-100 text-violet-800 text-[11px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Data Aggregation</h4>
                  <p className="text-[11px] text-slate-600">Reports are grouped by geographical location.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-100 text-violet-800 text-[11px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Risk Mapping</h4>
                  <p className="text-[11px] text-slate-600">Areas receive color-coded safety indicators based on feedback volume, recency and consistency.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-100 text-violet-800 text-[11px] font-bold shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Safer Navigation</h4>
                  <p className="text-[11px] text-slate-600">Users can view safety zones and choose alternative routes.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Realtime Aggregate Metrics ───────────────────── */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-lg font-black font-mono text-slate-900">
              {COMMUNITY_HEATMAP_STATS.totalAnonymousReports}
            </div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight">
              Reports Aggregated
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="text-lg font-black font-mono text-emerald-800">
              {COMMUNITY_HEATMAP_STATS.verifiedSafeCorridors}
            </div>
            <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-tight">
              Safe Corridors
            </div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
            <div className="text-lg font-black font-mono text-rose-800">
              {COMMUNITY_HEATMAP_STATS.activeHotspots}
            </div>
            <div className="text-[10px] font-semibold text-rose-600 uppercase tracking-tight">
              Unsafe Spots
            </div>
          </div>
        </div>

        {/* ── Visual Color Legend ────────────────────────── */}
        <div className="p-3 rounded-xl bg-slate-100/70 border border-slate-200 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
            <span className="font-semibold text-slate-700">Safe (75-100)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
            <span className="font-semibold text-slate-700">Caution (50-74)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
            <span className="font-semibold text-slate-700">High Risk (&lt;50)</span>
          </div>
        </div>

        {/* ── Search Input ─────────────────────────────── */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search among 64 municipal sectors or wards..."
            className="w-full px-3 py-2 pl-9 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
          />
          <Compass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* ── Category Filter Tabs ───────────────────────── */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
          {[
            { id: 'ALL', label: `All (${COMMUNITY_SAFETY_ZONES.length})` },
            { id: 'SAFE', label: 'Safe (Green)' },
            { id: 'CAUTION', label: 'Caution (Amber)' },
            { id: 'HIGH_RISK', label: 'Risk (Red)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                filter === tab.id
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Safety Zones List ──────────────────────────── */}
        <div className="space-y-2.5">
          {filteredZones.map((zone) => {
            const isSelected = selectedZoneId === zone.id;
            const isSafe = zone.riskLevel === 'SAFE';
            const isCaution = zone.riskLevel === 'CAUTION' || zone.riskLevel === 'ELEVATED';
            const isHighRisk = zone.riskLevel === 'HIGH_RISK';

            return (
              <div
                key={zone.id}
                onClick={() => onFlyToZone(zone)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-violet-50/70 border-violet-400 ring-2 ring-violet-400/20 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      {zone.sector}
                    </span>
                    <h4 className="text-xs font-extrabold text-slate-900">
                      {zone.name}
                    </h4>
                  </div>
                  <div
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                      isSafe
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isCaution
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {zone.safetyScore}/100 {zone.riskLevel}
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                  {zone.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {zone.primaryFactors.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] text-slate-600 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
                  <span>{zone.reportCount} anonymous reports ({zone.recentReports24h} today)</span>
                  <span className="text-violet-700 font-bold flex items-center gap-0.5 hover:underline">
                    View on Map <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

