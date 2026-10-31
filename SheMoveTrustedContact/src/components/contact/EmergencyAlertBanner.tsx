'use client';

import React, { useEffect } from 'react';
import { ShieldAlert, PhoneCall, Volume2, VolumeX, ExternalLink, BatteryLow } from 'lucide-react';
import { Alert } from '@/lib/types';
import { soundManager } from '@/lib/sound';

interface EmergencyAlertBannerProps {
  alert: Alert;
  travellerPhone: string;
  travellerName: string;
  lastLocation: { lat: number; lng: number };
  batteryPct?: number;
}

export const EmergencyAlertBanner: React.FC<EmergencyAlertBannerProps> = ({
  alert,
  travellerPhone,
  travellerName,
  lastLocation,
  batteryPct,
}) => {
  const [muted, setMuted] = React.useState(soundManager.getMuted());

  useEffect(() => {
    // Play alert audio siren or beep
    if (alert.severity === 'CRITICAL') {
      soundManager.playCriticalAlertSiren();
    } else {
      soundManager.playHighAlertBeep();
    }
  }, [alert.id, alert.type]);

  const toggleSound = () => {
    const isNowMuted = soundManager.toggleMuted();
    setMuted(isNowMuted);
  };

  const getAlertDescription = (type: string) => {
    switch (type) {
      case 'PHONE_UNREACHABLE':
        return 'Traveller’s phone stopped responding (power off or damaged). Displaying last known location.';
      case 'SOS':
        return 'Immediate SOS triggered! Live location shared with trusted contacts & Police Command Center.';
      case 'MISSED_CHECKIN':
        return 'No response received during the 60s safety check-in window. Emergency escalation active.';
      case 'USER_REPORTED_UNSAFE':
        return 'Traveller reported feeling unsafe during safety check-in. Assistance requested.';
      case 'TRIP_OVERDUE':
        return 'Journey exceeded planned duration without safe arrival confirmation.';
      default:
        return 'Automated safety escalation triggered. Emergency dispatch notified.';
    }
  };

  const googleMapsUrl = `https://www.google.com/maps?q=${lastLocation.lat},${lastLocation.lng}`;
  const travellerFirstName = travellerName.split(' ')[0] || 'Traveller';

  return (
    <div className="w-full bg-red-600 text-white rounded-2xl p-4 shadow-2xl animate-critical-flash border-2 border-red-400 mb-3 select-none">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-white animate-bounce" />
          <span className="font-extrabold text-sm uppercase tracking-wider">
            {alert.type.replace(/_/g, ' ')}
          </span>
          <span className="text-[10px] uppercase font-bold bg-white text-red-700 px-2 py-0.5 rounded-full font-mono">
            {alert.severity}
          </span>
        </div>

        <button
          onClick={toggleSound}
          type="button"
          title={muted ? 'Unmute siren' : 'Mute siren'}
          className="p-1.5 rounded-full bg-red-800/80 hover:bg-red-700 text-white transition active:scale-90"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      <p className="text-xs text-red-100 mb-3 leading-relaxed font-sans">
        {getAlertDescription(alert.type)}
      </p>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <a
          href={`tel:${travellerPhone}`}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white text-red-700 font-bold rounded-xl shadow-lg hover:bg-zinc-100 transition active:scale-95"
        >
          <PhoneCall className="w-4 h-4 text-red-600" />
          <span>Call {travellerFirstName}</span>
        </a>

        <a
          href="tel:112"
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-red-950 text-white font-bold rounded-xl border border-red-400 shadow-lg hover:bg-red-900 transition active:scale-95"
        >
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>Call Police (112)</span>
        </a>
      </div>

      <div className="mt-2.5 pt-2 border-t border-red-500/60 flex items-center justify-between text-[11px] text-red-100 font-mono">
        <span>Raised: {new Date(alert.raised_at).toLocaleTimeString()}</span>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white flex items-center gap-1"
        >
          <span>Open Coordinates</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
