'use client';

import React, { useState } from 'react';
import { X, Radio, Car, Navigation, Clock } from 'lucide-react';
import { soundManager } from '@/lib/sound';

interface DispatchModalProps {
  isOpen: boolean;
  tripId: string;
  onClose: () => void;
  onDispatch: (
    tripId: string,
    unitCallsign: string,
    officerInCharge: string,
    etaMinutes: number,
    notes: string
  ) => void;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  isOpen,
  tripId,
  onClose,
  onDispatch,
}) => {
  const [unitCallsign, setUnitCallsign] = useState('PCR-ECHO-14');
  const [officerInCharge, setOfficerInCharge] = useState('Sub-Inspector Devendra Kumar');
  const [etaMinutes, setEtaMinutes] = useState(4);
  const [notes, setNotes] = useState('Immediate interception of vehicle. Escort traveller and verify safety.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playDispatchRadioChirp();
    onDispatch(tripId, unitCallsign, officerInCharge, etaMinutes, notes);
    onClose();
  };

  const units = [
    { value: 'PCR-ECHO-14', label: 'PCR-ECHO-14', sub: 'Sector Central — Rajiv Chowk' },
    { value: 'PCR-BRAVO-09', label: 'PCR-BRAVO-09', sub: 'South Rapid Response — Hauz Khas' },
    { value: 'CHETAK-03', label: 'CHETAK-03', sub: 'High-Speed Interceptor' },
    { value: 'PCR-DELTA-22', label: 'PCR-DELTA-22', sub: 'Dwarka Sub-Division' },
  ];

  const inputStyle = {
    background: '#0a1628',
    border: '1px solid #0f2040',
    color: '#e2e8f0',
    borderRadius: '10px',
    padding: '10px 12px',
    fontSize: '12px',
    width: '100%',
    outline: 'none',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#07101f', border: '1px solid #1e3a5f', boxShadow: '0 0 60px #22d3ee15' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #0f2040', background: '#060b14' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#0e7490,#0891b2)', boxShadow: '0 0 15px #22d3ee30' }}>
              <Radio className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Dispatch 112 PCR Unit</div>
              <div className="text-[10px]" style={{ color: '#334155' }}>Emergency tactical response</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-all"
            style={{ color: '#475569' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#0f2040')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Unit selector as cards */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-2"
              style={{ color: '#475569' }}>
              Patrol Unit
            </label>
            <div className="space-y-1.5">
              {units.map((u) => (
                <label key={u.value}
                  className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: unitCallsign === u.value ? '#0f2040' : '#0a1628',
                    border: `1px solid ${unitCallsign === u.value ? '#22d3ee' : '#0f2040'}`,
                  }}>
                  <input type="radio" name="unit" value={u.value}
                    checked={unitCallsign === u.value}
                    onChange={() => setUnitCallsign(u.value)}
                    className="sr-only" />
                  <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0"
                    style={{ borderColor: unitCallsign === u.value ? '#22d3ee' : '#1e3a5f' }}>
                    {unitCallsign === u.value && (
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22d3ee' }} />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold font-mono" style={{ color: '#22d3ee' }}>{u.label}</div>
                    <div className="text-[10px]" style={{ color: '#334155' }}>{u.sub}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Officer */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5"
              style={{ color: '#475569' }}>
              Field Officer in Charge
            </label>
            <input
              type="text"
              value={officerInCharge}
              onChange={(e) => setOfficerInCharge(e.target.value)}
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = '#22d3ee')}
              onBlur={e => (e.currentTarget.style.borderColor = '#0f2040')}
              required
            />
          </div>

          {/* ETA */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5"
              style={{ color: '#475569' }}>
              ETA (Minutes)
            </label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Clock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#334155' }} />
                <input
                  type="number"
                  min={1} max={60}
                  value={etaMinutes}
                  onChange={(e) => setEtaMinutes(Number(e.target.value))}
                  style={{ ...inputStyle, width: '100px', paddingLeft: '28px', fontFamily: 'monospace' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#22d3ee')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#0f2040')}
                />
              </div>
              <span className="text-[10px]" style={{ color: '#334155' }}>via emergency siren protocol</span>
            </div>
          </div>

          {/* Tactical notes */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5"
              style={{ color: '#475569' }}>
              Tactical Instructions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ ...inputStyle, resize: 'none' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#22d3ee')}
              onBlur={e => (e.currentTarget.style.borderColor = '#0f2040')}
            />
          </div>

          {/* GPS broadcast info */}
          <div className="p-3 rounded-xl text-[10px]"
            style={{ background: '#083344', border: '1px solid #164e63', color: '#67e8f9' }}>
            📡 <span className="font-bold">112 CAD Broadcast:</span> Alert GPS coordinates and vehicle plate data will be transmitted directly to the unit's in-car terminal upon dispatch.
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: '#0a1628', color: '#64748b', border: '1px solid #0f2040' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0f2040')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0a1628')}>
              Cancel
            </button>
            <button type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={{ background: 'linear-gradient(135deg,#0e7490,#0891b2)', color: '#fff', boxShadow: '0 0 20px #22d3ee30' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg,#0891b2,#06b6d4)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg,#0e7490,#0891b2)')}>
              <Navigation className="w-3.5 h-3.5" />
              <span>Authorize & Transmit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
