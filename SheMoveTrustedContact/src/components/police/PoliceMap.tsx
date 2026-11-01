'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PoliceStation, Trip } from '@/lib/types';
import {
  Layers,
  Crosshair,
  Map as MapIcon,
  Compass,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Flame,
  Info,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import {
  COMMUNITY_SAFETY_ZONES,
  METROPOLITAN_OUTER_BOUNDARY,
  COMMUNITY_HEATMAP_STATS,
  SafetyHeatZone,
} from '@/lib/safetyHeatmapData';
import { CommunityHeatmapDrawer } from './CommunityHeatmapDrawer';

interface PoliceMapProps {
  trips: Trip[];
  stations: PoliceStation[];
  selectedTripId?: string;
  onSelectTrip: (tripId: string) => void;
}

export const PoliceMap: React.FC<PoliceMapProps> = ({
  trips,
  stations,
  selectedTripId,
  onSelectTrip,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [tripId: string]: any }>({});
  const stationLayersRef = useRef<any[]>([]);
  const trailPolylineRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);
  const heatZoneLayersRef = useRef<any[]>([]);

  const [showPolygons, setShowPolygons] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [isHeatmapDrawerOpen, setIsHeatmapDrawerOpen] = useState(false);
  const [selectedHeatZoneId, setSelectedHeatZoneId] = useState<string | undefined>(undefined);
  const [mapStyle, setMapStyle] = useState<'dark' | 'street'>('street');
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // A trip is in "alert mode" if it has any OPEN or ACKNOWLEDGED alert
  const alertTripIds = new Set(
    trips
      .filter((t) => t.alerts.some((a) => a.status === 'OPEN' || a.status === 'ACKNOWLEDGED'))
      .map((t) => t.id)
  );
  const hasAnyAlert = alertTripIds.size > 0;

  // The selected trip — only show exact location if it has an active alert
  const selectedTrip = trips.find((t) => t.id === selectedTripId);
  const selectedTripHasAlert = selectedTripId ? alertTripIds.has(selectedTripId) : false;

  // Initialize Leaflet
  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      const L = (await import('leaflet')).default;

      if (!isMounted) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [28.6139, 77.209],
          zoom: 12,
          zoomControl: false,
          attributionControl: false,
        });

        L.control.zoom({ position: 'topright' }).addTo(map);
        mapInstanceRef.current = map;
        setLeafletLoaded(true);
      }
    }

    init();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletLoaded) return;
    const map = mapInstanceRef.current;

    map.eachLayer((layer: any) => {
      if (layer._url) map.removeLayer(layer);
    });

    import('leaflet').then((L) => {
      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: 'abc',
        className: mapStyle === 'dark' ? 'tactical-dark-tiles' : '',
      }).addTo(map);
    });
  }, [mapStyle, leafletLoaded]);

  // Render Station Polygons
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletLoaded) return;
    const map = mapInstanceRef.current;

    import('leaflet').then((L) => {
      stationLayersRef.current.forEach((layer) => map.removeLayer(layer));
      stationLayersRef.current = [];

      if (!showPolygons) return;

      stations.forEach((st) => {
        const tripsInStation = trips.filter((t) => t.current_station_id === st.id);
        const alertsInStation = tripsInStation.filter((t) => alertTripIds.has(t.id)).length;

        // Jurisdiction boundary
        const polygon = L.default.polygon(st.jurisdictionPolygon as any, {
          color: st.jurisdictionColor,
          weight: alertsInStation > 0 ? 3 : 1.5,
          opacity: alertsInStation > 0 ? 1 : 0.6,
          fillColor: st.jurisdictionColor,
          fillOpacity: alertsInStation > 0 ? 0.15 : 0.06,
          dashArray: alertsInStation > 0 ? '' : '4, 8',
        }).addTo(map);

        polygon.bindTooltip(
          `<div style="font-size:11px; font-weight:700; color:#fff; padding:2px 6px; background:#0a1628; border-radius:6px; border:1px solid #1e3a5f;">
            ${st.name} — ${tripsInStation.length} users${alertsInStation > 0 ? ` • ⚠️ ${alertsInStation} alert` : ''}
          </div>`,
          { permanent: false, direction: 'center', className: 'cad-tooltip' }
        );

        // Station marker
        const stationIcon = L.default.divIcon({
          className: 'custom-station-icon',
          html: `<div style="
            background: ${alertsInStation > 0 ? '#ef4444' : st.jurisdictionColor};
            width:28px; height:28px; border-radius:8px; display:flex; align-items:center;
            justify-content:center; color:#fff; font-size:8px; font-weight:900;
            box-shadow: 0 0 ${alertsInStation > 0 ? '15px #ef444470' : '6px rgba(0,0,0,0.5)'};
            border: 2px solid rgba(255,255,255,0.3);
          ">STA</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.default.marker([st.location.lat, st.location.lng], { icon: stationIcon })
          .addTo(map)
          .bindPopup(`
            <div style="padding:8px; min-width:180px; background:#0a1628; color:#e2e8f0; border-radius:8px;">
              <div style="font-weight:700; font-size:13px; color:#fff; margin-bottom:4px">${st.name}</div>
              <div style="font-size:10px; color:#64748b; font-family:monospace">Code: ${st.code}</div>
              <div style="font-size:11px; color:#94a3b8; margin-top:4px">${st.address}</div>
              <div style="margin-top:6px; padding:4px 8px; background:#0f2040; border-radius:6px; display:flex; justify-content:space-between;">
                <span style="font-size:10px; color:#64748b">Users in zone:</span>
                <span style="font-size:12px; font-weight:700; color:#38bdf8; font-family:monospace">${tripsInStation.length}</span>
              </div>
              <div style="font-size:10px; color:#3b82f6; margin-top:4px">📞 ${st.phone}</div>
            </div>
          `);

        stationLayersRef.current.push(polygon, marker);
      });
    });
  }, [stations, showPolygons, leafletLoaded, trips, alertTripIds]);

  // Render Community-Driven Safety Heatmap Zones Overlay
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletLoaded) return;
    const map = mapInstanceRef.current;

    import('leaflet').then((L) => {
      heatZoneLayersRef.current.forEach((layer) => map.removeLayer(layer));
      heatZoneLayersRef.current = [];

      if (!showHeatmap) return;

      // 1. Draw Master Metropolitan Outer Jurisdiction Boundary (Dark prominent perimeter)
      if (METROPOLITAN_OUTER_BOUNDARY && METROPOLITAN_OUTER_BOUNDARY.length > 0) {
        const outerPoly = L.default.polygon(METROPOLITAN_OUTER_BOUNDARY as any, {
          color: '#0f172a',
          weight: 3.5,
          opacity: 0.9,
          fill: false,
          dashArray: '10, 6',
        }).addTo(map);

        outerPoly.bindTooltip(
          `<div style="font-size:11px; font-weight:900; color:#fff; padding:4px 10px; background:#0f172a; border-radius:6px; box-shadow:0 4px 14px rgba(0,0,0,0.3); border:1px solid #334155;">
            METROPOLITAN COMMUNITY SAFETY PERIMETER (64 SECTORS)
          </div>`,
          { permanent: false, direction: 'top' }
        );
        heatZoneLayersRef.current.push(outerPoly);
      }

      // 2. Draw all contiguous municipal ward safety cells across complete map
      COMMUNITY_SAFETY_ZONES.forEach((zone) => {
        const isSelected = selectedHeatZoneId === zone.id;
        const poly = L.default.polygon(zone.polygon as any, {
          color: isSelected ? '#7c3aed' : '#ffffff', // Crisp white dummy boundaries between contiguous cells!
          weight: isSelected ? 3.5 : 1.4,
          opacity: isSelected ? 1 : 0.9,
          fillColor: zone.color,
          fillOpacity: isSelected ? 0.72 : zone.fillOpacity,
        }).addTo(map);

        poly.bindTooltip(
          `<div style="font-size:11px; font-weight:800; color:#0f172a; padding:3px 8px; background:#ffffff; border-radius:6px; box-shadow:0 4px 14px rgba(0,0,0,0.18); border:1px solid #cbd5e1;">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${zone.color}; margin-right:4px;"></span>
            ${zone.name} &bull; <strong>${zone.safetyScore}/100</strong>
          </div>`,
          { permanent: false, direction: 'center', className: 'heat-tooltip' }
        );

        poly.bindPopup(`
          <div style="font-family:sans-serif; padding:10px; min-width:240px; background:#ffffff; color:#0f172a; border-radius:12px; box-shadow:0 12px 30px rgba(0,0,0,0.15);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:10px; font-weight:800; text-transform:uppercase; color:#64748b;">${zone.sector}</span>
              <span style="font-size:10px; font-weight:900; padding:2px 8px; border-radius:999px; background:${zone.riskLevel === 'SAFE' ? '#dcfce7' : zone.riskLevel === 'HIGH_RISK' ? '#fee2e2' : '#fef3c7'}; color:${zone.riskLevel === 'SAFE' ? '#166534' : zone.riskLevel === 'HIGH_RISK' ? '#991b1b' : '#92400e'}; border:1px solid ${zone.color};">
                ${zone.safetyScore}/100 ${zone.riskLevel}
              </span>
            </div>
            <div style="font-size:13px; font-weight:800; color:#0f172a; margin-bottom:4px;">${zone.name}</div>
            <div style="font-size:11px; color:#475569; margin-bottom:8px; line-height:1.4;">${zone.description}</div>
            <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:8px;">
              ${zone.primaryFactors.map((f: string) => `<span style="font-size:9px; background:#f1f5f9; padding:2px 6px; border-radius:4px; color:#334155; font-weight:600;">${f}</span>`).join('')}
            </div>
            <div style="display:flex; justify-content:space-between; font-size:10px; color:#64748b; border-top:1px solid #f1f5f9; padding-top:6px;">
              <span>👥 ${zone.reportCount} reports (${zone.recentReports24h} today)</span>
              <span>💡 ${zone.lightingRating}</span>
            </div>
          </div>
        `);

        poly.on('click', () => {
          setSelectedHeatZoneId(zone.id);
          setIsHeatmapDrawerOpen(true);
        });

        heatZoneLayersRef.current.push(poly);

        // Center label marker on each cell (matching Dribbble GIS style)
        const labelIcon = L.default.divIcon({
          className: 'custom-sector-center-label',
          html: `<div style="
            font-size:8.5px;
            font-weight:800;
            color:rgba(15,23,42,0.85);
            text-align:center;
            pointer-events:none;
            white-space:nowrap;
            text-shadow:0 0 3px #ffffff, 0 0 5px #ffffff;
            transform:translate(-50%, -50%);
          ">${zone.name.split(' ')[0]}<br/><span style="font-size:7.5px; opacity:0.8; font-weight:900;">${zone.safetyScore}</span></div>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });
        const labelMarker = L.default.marker(zone.center, { icon: labelIcon, interactive: false }).addTo(map);
        heatZoneLayersRef.current.push(labelMarker);

        // Center warning alert badge for high risk hotspots
        if (zone.riskLevel === 'HIGH_RISK') {
          const badgeIcon = L.default.divIcon({
            className: 'custom-heat-badge',
            html: `<div style="
              background:#dc2626;
              color:#fff;
              width:18px;
              height:18px;
              border-radius:50%;
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:9px;
              font-weight:900;
              box-shadow:0 0 8px rgba(220,38,38,0.8);
              border:1.5px solid #fff;
              cursor:pointer;
            ">!</div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          });
          const badgeMarker = L.default.marker(zone.center, { icon: badgeIcon }).addTo(map);
          badgeMarker.on('click', () => {
            setSelectedHeatZoneId(zone.id);
            setIsHeatmapDrawerOpen(true);
          });
          heatZoneLayersRef.current.push(badgeMarker);
        }
      });
    });
  }, [showHeatmap, selectedHeatZoneId, leafletLoaded]);

  // Render Markers — ONLY exact location for alert trips; others show approximate cluster dots
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletLoaded) return;
    const map = mapInstanceRef.current;

    import('leaflet').then((L) => {
      Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
      markersRef.current = {};

      if (accuracyCircleRef.current) { map.removeLayer(accuracyCircleRef.current); accuracyCircleRef.current = null; }
      if (trailPolylineRef.current) { map.removeLayer(trailPolylineRef.current); trailPolylineRef.current = null; }

      trips.forEach((trip) => {
        const isSelected = trip.id === selectedTripId;
        const hasAlert = alertTripIds.has(trip.id);
        const latestAlert = trip.alerts.find((a) => a.status === 'OPEN' || a.status === 'ACKNOWLEDGED');
        const isCritical = hasAlert && latestAlert?.severity === 'CRITICAL';
        const isHigh = hasAlert && latestAlert?.severity === 'HIGH';

        // For non-alert trips: show a subtle blurred/approximate dot instead of exact position
        // We slightly offset the position for privacy (jitter ±0.002 degrees ≈ 200m)
        const lat = hasAlert
          ? trip.last_location.lat
          : trip.last_location.lat + (Math.random() - 0.5) * 0.004;
        const lng = hasAlert
          ? trip.last_location.lng
          : trip.last_location.lng + (Math.random() - 0.5) * 0.004;

        let markerHtml = '';

        if (hasAlert) {
          // Full precise marker for alert trips
          const ringHtml = isCritical
            ? `<div style="position:absolute;inset:-12px;border-radius:50%;background:#ef444430;animation:ping 1s ease-in-out infinite;"></div>
               <div style="position:absolute;inset:-20px;border-radius:50%;border:2px solid #ef444450;animation:radarPing 2s ease-out infinite;"></div>`
            : isHigh
            ? `<div style="position:absolute;inset:-10px;border-radius:50%;background:#f9731630;animation:ping 1.2s ease-in-out infinite;"></div>`
            : '';

          const isReal = trip.is_simulation === false || trip.source === 'mobile_app';
          markerHtml = `
            <div style="position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;">
              ${ringHtml}
              <div style="
                background: ${isCritical ? 'linear-gradient(135deg,#ef4444,#dc2626)' : isHigh ? 'linear-gradient(135deg,#f97316,#ea580c)' : '#22c55e'};
                width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;
                font-weight:900;font-size:10px;color:#fff;
                box-shadow: 0 0 ${isCritical ? '20px #ef444480' : '8px rgba(0,0,0,0.4)'};
                border:2px solid ${isSelected ? '#fff' : 'rgba(255,255,255,0.3)'};
                transform:${isSelected ? 'scale(1.3)' : 'scale(1)'};
                transition:transform 0.2s;
              ">
                ${isCritical ? 'SOS' : isHigh ? 'ALT' : 'TR'}
              </div>
              <div style="position:absolute;top:-22px;white-space:nowrap;background:${isReal ? '#062817ee' : '#0a162890'};color:${isReal ? '#86efac' : '#fff'};font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;border:1px solid ${isReal ? '#15803d' : '#1e3a5f'};backdrop-filter:blur(4px);">
                ${isReal ? '🟢 ' : ''}${trip.traveller_name.split(' ')[0]} ${trip.vehicle_number ? `• ${trip.vehicle_number.slice(-4)}` : ''}
              </div>
            </div>
          `;
        } else {
          // Privacy mode: subtle non-exact dot
          markerHtml = `
            <div style="position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;">
              <div style="
                background: ${isSelected ? '#3b82f6' : '#22c55e'};
                width:10px;height:10px;border-radius:50%;opacity:0.6;
                box-shadow: 0 0 8px ${isSelected ? '#3b82f650' : '#22c55e50'};
                border:1px solid rgba(255,255,255,0.2);
              "></div>
            </div>
          `;
        }

        const customIcon = L.default.divIcon({
          className: 'custom-trip-marker',
          html: markerHtml,
          iconSize: hasAlert ? [32, 32] : [10, 10],
          iconAnchor: hasAlert ? [16, 16] : [5, 5],
        });

        const marker = L.default.marker([lat, lng], {
          icon: customIcon,
          zIndexOffset: isSelected ? 1000 : isCritical ? 900 : hasAlert ? 500 : 10,
        }).addTo(map);

        marker.on('click', () => onSelectTrip(trip.id));

        if (hasAlert) {
          const isRealUserTrip = trip.is_simulation === false || trip.source === 'mobile_app';
          marker.bindPopup(`
            <div style="padding:10px;min-width:210px;background:#0a1628;color:#e2e8f0;border-radius:8px;">
              ${isRealUserTrip ? '<div style="font-size:9px;color:#34d399;font-weight:800;margin-bottom:6px;letter-spacing:0.5px;">🟢 LIVE MOBILE APP USER</div>' : ''}
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <span style="font-weight:700;font-size:13px;color:#fff;">${trip.traveller_name}</span>
                <span style="font-size:9px;font-weight:900;padding:2px 6px;border-radius:4px;background:${isCritical ? '#7f1d1d' : '#7c2d12'};color:${isCritical ? '#f87171' : '#fb923c'};">
                  ${latestAlert?.severity || 'ALERT'}
                </span>
              </div>
              <div style="font-size:10px;color:#64748b;font-family:monospace;margin-bottom:6px;">${trip.traveller_phone}</div>
              <div style="background:#0f2040;border-radius:6px;padding:6px 8px;font-size:10px;color:#60a5fa;font-family:monospace;">
                📍 ${trip.last_location.lat.toFixed(5)}, ${trip.last_location.lng.toFixed(5)}
              </div>
              <div style="display:flex;justify-content:space-between;font-size:10px;color:#475569;margin-top:6px;">
                <span>🔋 ${trip.last_battery_pct}%</span>
                <span>📡 ±${trip.last_accuracy_m}m</span>
                <span style="color:#fbbf24;font-weight:700;">${trip.vehicle_number || 'No plate'}</span>
              </div>
            </div>
          `);
        } else {
          // Non-alert tooltip only shows count info, not exact coordinates
          marker.bindPopup(`
            <div style="padding:8px;min-width:160px;background:#0a1628;color:#e2e8f0;border-radius:8px;">
              <div style="font-weight:700;font-size:12px;color:#fff;margin-bottom:4px;">${trip.traveller_name}</div>
              <div style="font-size:10px;color:#34d399;margin-bottom:4px;">✅ Journey Active - Safe</div>
              <div style="background:#0f2040;border-radius:6px;padding:4px 8px;font-size:10px;color:#64748b;">
                🔒 Exact location protected
              </div>
              <div style="font-size:9px;color:#1e3a5f;margin-top:4px;">Location revealed only if alert raised</div>
            </div>
          `);
        }

        markersRef.current[trip.id] = marker;

        // Precision overlay only for selected alert trips
        if (isSelected && hasAlert) {
          accuracyCircleRef.current = L.default.circle([trip.last_location.lat, trip.last_location.lng], {
            radius: Math.max(20, trip.last_accuracy_m || 25),
            color: isCritical ? '#ef4444' : '#3b82f6',
            fillColor: isCritical ? '#ef4444' : '#3b82f6',
            fillOpacity: 0.15,
            weight: 1.5,
            dashArray: '3, 5',
          }).addTo(map);

          if (trip.location_history && trip.location_history.length > 1) {
            const latLngs = trip.location_history.map((pt) => [pt.lat, pt.lng]);
            trailPolylineRef.current = L.default.polyline(latLngs as any, {
              color: isCritical ? '#ef4444' : '#60a5fa',
              weight: 3,
              opacity: 0.8,
              lineJoin: 'round',
            }).addTo(map);
          }
        }
      });
    });
  }, [trips, selectedTripId, leafletLoaded, onSelectTrip, alertTripIds]);

  // Auto-center map on selected trip — only fly to exact location if it has an alert
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedTripId) return;
    const selected = trips.find((t) => t.id === selectedTripId);
    if (selected) {
      const hasAlert = alertTripIds.has(selected.id);
      mapInstanceRef.current.flyTo(
        [selected.last_location.lat, selected.last_location.lng],
        hasAlert ? 16 : 13, // Zoom in more for alerts; less for normal trips
        { duration: 1.4 }
      );
    }
  }, [selectedTripId]);

  const handleFitAll = () => {
    if (!mapInstanceRef.current || trips.length === 0) return;
    import('leaflet').then((L) => {
      const bounds = L.default.latLngBounds(trips.map((t) => [t.last_location.lat, t.last_location.lng] as any));
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    });
  };

  const handleCenterEmergency = () => {
    if (!mapInstanceRef.current) return;
    const emergencyTrip = trips.find((t) => t.status === 'ALERT_RAISED');
    if (emergencyTrip) {
      onSelectTrip(emergencyTrip.id);
      mapInstanceRef.current.flyTo(
        [emergencyTrip.last_location.lat, emergencyTrip.last_location.lng],
        16,
        { duration: 1.4 }
      );
    } else {
      handleFitAll();
    }
  };

  return (
    <div className="relative flex-1 h-full w-full overflow-hidden" style={{ background: '#060b14' }}>
      {/* Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Privacy Mode Indicator — only when NO active alerts */}
      {!hasAnyAlert && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[500] pointer-events-none"
          style={{ zIndex: 400 }}>
          <div className="flex flex-col items-center gap-2 px-5 py-4 rounded-2xl text-center"
            style={{ background: 'rgba(7,16,31,0.85)', border: '1px solid #1e3a5f', backdropFilter: 'blur(12px)' }}>
            <Lock className="w-6 h-6" style={{ color: '#334155' }} />
            <div className="text-xs font-bold" style={{ color: '#475569' }}>Privacy Mode</div>
            <div className="text-[10px]" style={{ color: '#334155' }}>
              Exact locations hidden.<br />Showing zones only.
            </div>
          </div>
        </div>
      )}

      {/* Alert Mode Banner */}
      {hasAnyAlert && (
        <div className="absolute top-0 left-0 right-0 z-[401] flex justify-center"
          style={{ pointerEvents: 'none' }}>
          <div className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold"
            style={{
              background: 'linear-gradient(90deg, #450a0a, #7f1d1d, #450a0a)',
              color: '#f87171',
              animation: 'criticalPulse 2s ease-in-out infinite',
            }}>
            <Unlock className="w-3.5 h-3.5" />
            ALERT ACTIVE — EXACT LOCATION TRACKING ENABLED
            <Unlock className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* Floating Map Controls Toolbar */}
      <div className="absolute top-3 left-3 z-[400] flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl"
        style={{ background: 'rgba(6,11,20,0.85)', border: '1px solid #0f2040', backdropFilter: 'blur(16px)' }}>

        <button
          onClick={handleCenterEmergency}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{
            background: hasAnyAlert ? 'linear-gradient(135deg,#ef4444,#dc2626)' : '#0f2040',
            color: '#fff',
            boxShadow: hasAnyAlert ? '0 0 15px #ef444440' : 'none',
          }}
          title="Fly to priority emergency">
          <Crosshair className="w-3.5 h-3.5" />
          <span>{hasAnyAlert ? 'Priority Alert' : 'Fit Zones'}</span>
        </button>

        <button
          onClick={handleFitAll}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all"
          style={{ background: '#0f2040', color: '#93c5fd', border: '1px solid #1e3a5f' }}
          title="Fit all zones">
          <Compass className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <div className="w-px h-4" style={{ background: '#1e3a5f' }} />

        <button
          onClick={() => setShowPolygons(!showPolygons)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all"
          style={{
            background: showPolygons ? '#1e3a5f' : '#050d1a',
            color: showPolygons ? '#60a5fa' : '#334155',
            border: `1px solid ${showPolygons ? '#1e40af' : '#0f2040'}`,
          }}
          title="Toggle jurisdictions">
          <Layers className="w-3.5 h-3.5" />
          <span>Zones</span>
        </button>

        <button
          onClick={() => setMapStyle(mapStyle === 'dark' ? 'street' : 'dark')}
          className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all"
          style={{ background: '#050d1a', color: '#475569', border: '1px solid #0f2040' }}
          title="Toggle map style">
          {mapStyle === 'dark' ? 'DARK' : 'STREET'}
        </button>

        <div className="w-px h-4" style={{ background: '#1e3a5f' }} />

        {/* Community-Driven Safety Heatmap Button */}
        <button
          onClick={() => {
            const next = !showHeatmap;
            setShowHeatmap(next);
            if (next) {
              setMapStyle('street'); // Automatically switches map into light mode!
              setIsHeatmapDrawerOpen(true);
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
            showHeatmap
              ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 text-white shadow-md ring-1 ring-white/30'
              : 'bg-[#0f2040] text-slate-300 border border-[#1e3a5f] hover:bg-[#152a4d]'
          }`}
          title="Toggle Community-Driven Safety Heatmap">
          <Flame className="w-3.5 h-3.5 text-amber-200" />
          <span>Safety Heatmap</span>
          {showHeatmap && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
        </button>

        {showHeatmap && (
          <button
            onClick={() => setIsHeatmapDrawerOpen(!isHeatmapDrawerOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-900 border border-slate-300 hover:bg-slate-100 shadow-sm transition-all"
            title="Open Community Intelligence panel">
            <Info className="w-3.5 h-3.5 text-violet-600" />
            <span>Community Intel</span>
          </button>
        )}
      </div>

      {/* Community Safety Heatmap Legend (Light Mode) */}
      {showHeatmap && (
        <div
          className="absolute bottom-4 left-3 z-[400] p-3.5 rounded-2xl hidden sm:block max-w-xs transition-all shadow-xl animate-in fade-in"
          style={{
            background: 'rgba(255, 255, 255, 0.96)',
            border: '1px solid #cbd5e1',
            boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900">
                Safety Heatmap Zones
              </span>
            </div>
            <button
              onClick={() => setIsHeatmapDrawerOpen(true)}
              className="text-[10px] font-bold text-violet-700 hover:underline"
            >
              How It Works &rarr;
            </button>
          </div>
          <div className="space-y-1">
            {[
              { color: '#16a34a', label: 'Safe Corridor (Score 75-100)' },
              { color: '#ca8a04', label: 'Caution Zone (Score 50-74)' },
              { color: '#ea580c', label: 'Elevated Risk (Score 35-49)' },
              { color: '#dc2626', label: 'High Risk Hotspot (Score <35)' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ background: color }} />
                <span className="text-[10px] font-medium text-slate-700">{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-2.5 pt-1.5 text-[9px] text-slate-500 border-t border-slate-100 flex items-center justify-between">
            <span>Anonymous reports: 1,420</span>
            <span className="text-emerald-700 font-bold">Dynamic Zones</span>
          </div>
        </div>
      )}

      {/* Map Legend (Bottom Left, fallback when heatmap is off) */}
      {!showHeatmap && (
        <div className="absolute bottom-4 left-3 z-[400] p-3 rounded-xl hidden sm:block"
          style={{ background: 'rgba(6,11,20,0.88)', border: '1px solid #0f2040', backdropFilter: 'blur(16px)', pointerEvents: 'none' }}>
          <div className="text-[10px] font-black text-white mb-2 uppercase tracking-wider">Map Legend</div>
          <div className="space-y-1.5">
            {[
              { color: '#ef4444', glow: true, label: 'Critical Alert (SOS)', pulse: true },
              { color: '#f97316', glow: false, label: 'High Alert', pulse: false },
              { color: '#22c55e', glow: false, label: 'Normal Journey (approx. pos.)', pulse: true },
              { color: '#334155', glow: false, label: 'Zone boundary', pulse: false },
            ].map(({ color, label, pulse, glow }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${pulse ? 'animate-pulse' : ''}`}
                  style={{ background: color, boxShadow: glow ? `0 0 6px ${color}` : 'none' }} />
                <span className="text-[10px]" style={{ color: '#475569' }}>{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 text-[9px] font-semibold flex items-center gap-1"
            style={{ borderTop: '1px solid #0f2040', color: '#1e3a5f' }}>
            <Lock className="w-2.5 h-2.5" /> Privacy: Exact location only on alert
          </div>
        </div>
      )}

      {/* Live user count overlay */}
      <div className="absolute bottom-4 right-4 z-[400]"
        style={{ pointerEvents: 'none' }}>
        <div className="px-3 py-2 rounded-xl text-center"
          style={{ background: 'rgba(6,11,20,0.85)', border: '1px solid #0f2040', backdropFilter: 'blur(16px)' }}>
          <div className="text-2xl font-black font-mono text-white">{trips.length}</div>
          <div className="text-[10px]" style={{ color: '#334155' }}>users in jurisdiction</div>
          {hasAnyAlert && (
            <div className="text-[10px] font-bold mt-1 animate-pulse" style={{ color: '#f87171' }}>
              {alertTripIds.size} ALERT{alertTripIds.size > 1 ? 'S' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Community Intelligence Drawer (Light Mode) */}
      <CommunityHeatmapDrawer
        isOpen={isHeatmapDrawerOpen}
        onClose={() => setIsHeatmapDrawerOpen(false)}
        onFlyToZone={(zone) => {
          setSelectedHeatZoneId(zone.id);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo(zone.center, 15, { duration: 1.2 });
          }
        }}
        selectedZoneId={selectedHeatZoneId}
        isMapLightMode={mapStyle === 'street'}
        onToggleMapLightMode={() => setMapStyle(mapStyle === 'dark' ? 'street' : 'dark')}
      />
    </div>
  );
};
