'use client';

import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

interface ResolveModalProps {
  isOpen: boolean;
  alertId: string;
  onClose: () => void;
  onResolve: (alertId: string, notes: string, outcome: string) => void;
}

export const ResolveModal: React.FC<ResolveModalProps> = ({
  isOpen,
  alertId,
  onClose,
  onResolve,
}) => {
  const [outcome, setOutcome] = useState('RESOLVED_SAFE');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onResolve(alertId, notes || 'Verified and resolved by officer on duty.', outcome);
    onClose();
  };

  const outcomes = [
    { value: 'RESOLVED_SAFE', label: 'Verified Safe / Safe Arrival Confirmed', icon: '✅' },
    { value: 'DISPATCHED_ASSISTANCE', label: 'Patrol Unit Intercepted & Provided Assistance', icon: '🚔' },
    { value: 'CONTACTED_TRAVELLER', label: 'Direct Phone Contact — All Clear', icon: '📞' },
    { value: 'FALSE_ALARM', label: 'False Alarm / Cancel PIN Validated', icon: '❌' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#07101f', border: '1px solid #1e3a5f' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #0f2040', background: '#060b14' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#052e16', border: '1px solid #14532d' }}>
              <CheckCircle className="w-4 h-4" style={{ color: '#34d399' }} />
            </div>
            <span className="font-bold text-sm text-white">Resolve Emergency Incident</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-all"
            style={{ color: '#475569' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#0f2040')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Outcome selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: '#475569' }}>
              Resolution Outcome
            </label>
            <div className="space-y-1.5">
              {outcomes.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: outcome === opt.value ? '#0f2040' : '#0a1628',
                    border: `1px solid ${outcome === opt.value ? '#3b82f6' : '#0f2040'}`,
                  }}>
                  <input
                    type="radio"
                    name="outcome"
                    value={opt.value}
                    checked={outcome === opt.value}
                    onChange={(e) => setOutcome(e.target.value)}
                    className="sr-only"
                  />
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                    style={{ borderColor: outcome === opt.value ? '#3b82f6' : '#1e3a5f' }}>
                    {outcome === opt.value && (
                      <div className="w-2 h-2 rounded-full" style={{ background: '#3b82f6' }} />
                    )}
                  </div>
                  <span className="text-xs">{opt.icon} {opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: '#475569' }}>
              <FileText className="w-3 h-3 inline mr-1" />
              Officer Log & Resolution Notes
            </label>
            <textarea
              rows={3}
              placeholder="Enter official station diary log notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl text-xs focus:outline-none transition resize-none"
              style={{
                background: '#0a1628',
                border: '1px solid #0f2040',
                color: '#e2e8f0',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#3b82f6')}
              onBlur={e => (e.currentTarget.style.borderColor = '#0f2040')}
            />
          </div>

          {/* Audit note */}
          <div className="p-3 rounded-xl text-[10px]"
            style={{ background: '#050d1a', border: '1px solid #0f2040', color: '#334155' }}>
            🔒 <span className="font-bold" style={{ color: '#475569' }}>Audit Protocol:</span> This resolution will be timestamped, linked to your officer badge, and broadcast to all connected dispatch terminals.
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: '#0a1628', color: '#64748b', border: '1px solid #0f2040' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0f2040')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0a1628')}>
              Cancel
            </button>
            <button type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ background: 'linear-gradient(135deg,#047857,#065f46)', color: '#fff', boxShadow: '0 0 15px #04785730' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg,#059669,#047857)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg,#047857,#065f46)')}>
              Confirm Resolution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
