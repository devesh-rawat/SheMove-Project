'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { PoliceHeader } from '@/components/police/PoliceHeader';
import { AlertsQueuePanel } from '@/components/police/AlertsQueuePanel';
import { TripDetailPanel } from '@/components/police/TripDetailPanel';
import { ResolveModal } from '@/components/police/ResolveModal';
import { DispatchModal } from '@/components/police/DispatchModal';
import { DemoSimulationDrawer } from '@/components/police/DemoSimulationDrawer';
import {
  Alert,
  PoliceDashboardStats,
  PoliceOfficer,
  PoliceStation,
  Trip,
} from '@/lib/types';
import { DEMO_OFFICERS, POLICE_STATIONS } from '@/lib/store';
import { soundManager } from '@/lib/sound';

// Dynamically import Leaflet map with SSR disabled
const PoliceMap = dynamic(
  () => import('@/components/police/PoliceMap').then((mod) => mod.PoliceMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 h-full w-full bg-slate-950 flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
        <span className="text-xs font-semibold">Initializing Tactical CAD Map...</span>
      </div>
    ),
  }
);

export default function PoliceDashboardPage() {
  const router = useRouter();

  // Authentication & Officer State
  const [currentOfficer, setCurrentOfficer] = useState<PoliceOfficer>(DEMO_OFFICERS[0]);
  const [selectedStationId, setSelectedStationId] = useState<string>('all');
  const [stations, setStations] = useState<PoliceStation[]>(POLICE_STATIONS);

  // Data State
  const [trips, setTrips] = useState<Trip[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<PoliceDashboardStats>({
    activeTripsCount: 0,
    openAlertsCount: 0,
    criticalAlertsCount: 0,
    highAlertsCount: 0,
    mediumAlertsCount: 0,
    acknowledgedTodayCount: 0,
    resolvedTodayCount: 0,
    avgAckTimeSeconds: 74,
    activeStationsCount: 5,
  });

  // UI Selection State
  const [selectedTripId, setSelectedTripId] = useState<string | undefined>(undefined);

  // Modals & Drawer State
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [activeResolvingAlertId, setActiveResolvingAlertId] = useState<string>('');
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [activeDispatchTripId, setActiveDispatchTripId] = useState<string>('');
  const [isDemoDrawerOpen, setIsDemoDrawerOpen] = useState(false);

  // Track previous alerts to trigger audio siren on new CRITICAL incidents
  const [previousAlertIds, setPreviousAlertIds] = useState<Set<string>>(new Set());

  // Load Saved Officer
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOfficer = localStorage.getItem('safejourney_police_officer');
      if (savedOfficer) {
        try {
          const parsed = JSON.parse(savedOfficer);
          setCurrentOfficer(parsed);
          if (parsed.stationId && parsed.stationId !== 'all') {
            setSelectedStationId(parsed.stationId);
          }
        } catch {
          // keep default
        }
      }
    }
  }, []);

  // Fetch Stations
  useEffect(() => {
    fetch('/api/v1/police/stations')
      .then((res) => res.json())
      .then((data) => {
        if (data.stations) {
          setStations(data.stations);
        }
      })
      .catch((err) => console.error('Failed to load stations', err));
  }, []);

  // Fetch Initial Data
  const fetchData = useCallback(async () => {
    try {
      const query = selectedStationId !== 'all' ? `?station_id=${selectedStationId}` : '';
      const [tripsRes, alertsRes] = await Promise.all([
        fetch(`/api/v1/police/trips${query}`),
        fetch(`/api/v1/police/alerts${query}`),
      ]);

      const tripsData = await tripsRes.json();
      const alertsData = await alertsRes.json();

      if (tripsData.trips) {
        setTrips(tripsData.trips);
        setStats(tripsData.stats);

        // Select first active or emergency trip by default if none selected
        if (!selectedTripId && tripsData.trips.length > 0) {
          const emergency = tripsData.trips.find((t: Trip) => t.status === 'ALERT_RAISED');
          setSelectedTripId(emergency ? emergency.id : tripsData.trips[0].id);
        }
      }

      if (alertsData.alerts) {
        setAlerts(alertsData.alerts);
      }
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    }
  }, [selectedStationId, selectedTripId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Connect to Real-time Server-Sent Events (SSE) Stream
  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/v1/police/stream');

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.trips) {
            let filteredTrips = payload.trips as Trip[];
            let filteredAlerts = payload.alerts as Alert[];

            if (selectedStationId !== 'all') {
              filteredTrips = filteredTrips.filter((t) => t.current_station_id === selectedStationId);
              filteredAlerts = filteredAlerts.filter((a) => a.station_id === selectedStationId);
            }

            setTrips(filteredTrips);
            setAlerts(filteredAlerts);
            if (payload.stats) setStats(payload.stats);

            // Audio Alert Trigger: check if new CRITICAL alert arrived
            const criticalAlerts = filteredAlerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'OPEN');
            const hasNewCritical = criticalAlerts.some((a) => !previousAlertIds.has(a.id));
            if (hasNewCritical) {
              soundManager.playCriticalAlertSiren();
            }

            const newIds = new Set(filteredAlerts.map((a) => a.id));
            setPreviousAlertIds(newIds);
          }
        } catch (e) {
          console.error('Error parsing SSE event', e);
        }
      };

      eventSource.onerror = () => {
        // Fallback polling will take over if SSE drops
      };
    } catch (err) {
      console.warn('SSE not supported, using polling fallback');
    }

    // Secondary Polling every 5 seconds for resilience
    const pollInterval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(pollInterval);
    };
  }, [selectedStationId, previousAlertIds, fetchData]);

  // Action: Acknowledge Alert
  const handleAcknowledgeAlert = async (alertId: string) => {
    soundManager.playAcknowledgeChime();
    try {
      const res = await fetch(`/api/v1/police/alerts/${alertId}/ack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerName: `${currentOfficer.rank} ${currentOfficer.name}` }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to acknowledge alert', err);
    }
  };

  // Action: Open Resolve Modal
  const handleOpenResolveModal = (alertId: string) => {
    setActiveResolvingAlertId(alertId);
    setIsResolveModalOpen(true);
  };

  // Action: Submit Resolution
  const handleResolveAlert = async (alertId: string, notes: string, outcome: string) => {
    soundManager.playAcknowledgeChime();
    try {
      const res = await fetch(`/api/v1/police/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          outcome,
          officerName: `${currentOfficer.rank} ${currentOfficer.name}`,
        }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to resolve alert', err);
    }
  };

  // Action: Open Dispatch Modal
  const handleOpenDispatchModal = (tripId: string) => {
    setActiveDispatchTripId(tripId);
    setIsDispatchModalOpen(true);
  };

  // Action: Submit Dispatch
  const handleDispatchUnit = async (
    tripId: string,
    unitCallsign: string,
    officerInCharge: string,
    etaMinutes: number,
    notes: string
  ) => {
    try {
      const res = await fetch('/api/v1/police/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          unitCallsign,
          officerInCharge,
          etaMinutes,
          notes,
        }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to dispatch unit', err);
    }
  };

  // Action: Run Demo Simulation Action
  const handleSimulateAction = async (action: string) => {
    try {
      const res = await fetch('/api/v1/demo/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, tripId: selectedTripId }),
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Simulation execution failed', err);
    }
  };

  // Action: Logout
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('safejourney_police_token');
      localStorage.removeItem('safejourney_police_officer');
    }
    router.push('/police/login');
  };

  const selectedTrip = trips.find((t) => t.id === selectedTripId);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* Police Command Header */}
      <PoliceHeader
        currentOfficer={currentOfficer}
        stations={stations}
        selectedStationId={selectedStationId}
        onSelectStation={(stId) => {
          setSelectedStationId(stId);
          setSelectedTripId(undefined);
        }}
        stats={stats}
        onOpenDemoDrawer={() => setIsDemoDrawerOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Command Operations Workspace (3-Panel Grid) */}
      <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-57px)] overflow-hidden">
        {/* Left: Alerts Queue & Active Trips Panel */}
        <AlertsQueuePanel
          alerts={alerts}
          trips={trips}
          selectedTripId={selectedTripId}
          onSelectTrip={(id) => setSelectedTripId(id)}
          onAcknowledgeAlert={handleAcknowledgeAlert}
        />

        {/* Center: Interactive Leaflet Tactical Map */}
        <PoliceMap
          trips={trips}
          stations={stations}
          selectedTripId={selectedTripId}
          onSelectTrip={(id) => setSelectedTripId(id)}
        />

        {/* Right: Selected Journey & Alert Dossier Inspection */}
        <TripDetailPanel
          trip={selectedTrip}
          onAcknowledgeAlert={handleAcknowledgeAlert}
          onOpenResolveModal={handleOpenResolveModal}
          onOpenDispatchModal={handleOpenDispatchModal}
        />
      </main>

      {/* Resolve Incident Modal */}
      <ResolveModal
        isOpen={isResolveModalOpen}
        alertId={activeResolvingAlertId}
        onClose={() => setIsResolveModalOpen(false)}
        onResolve={handleResolveAlert}
      />

      {/* 112 Patrol Unit Dispatch Modal */}
      <DispatchModal
        isOpen={isDispatchModalOpen}
        tripId={activeDispatchTripId}
        onClose={() => setIsDispatchModalOpen(false)}
        onDispatch={handleDispatchUnit}
      />

      {/* Demo Simulation Controller Drawer */}
      <DemoSimulationDrawer
        isOpen={isDemoDrawerOpen}
        onClose={() => setIsDemoDrawerOpen(false)}
        onSimulate={handleSimulateAction}
      />
    </div>
  );
}
