'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Loc, Pt } from '@/lib/types';

interface ContactMapProps {
  lastLocation: { lat: number; lng: number };
  accuracyM?: number;
  locationHistory?: { lat: number; lng: number; recorded_at?: string }[];
  isEmergency?: boolean;
  isStale?: boolean;
  destination?: { lat: number; lng: number };
  destinationName?: string;
  isDone?: boolean;
}

export const ContactMap: React.FC<ContactMapProps> = ({
  lastLocation,
  accuracyM = 15,
  locationHistory = [],
  isEmergency = false,
  isStale = false,
  destination,
  destinationName = 'Destination',
  isDone = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const plannedPolylineRef = useRef<any>(null);
  const followRef = useRef(true);
  const firstRef = useRef(true);

  const [follow, setFollow] = useState(true);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Initialize Leaflet Map with CartoDB / OSM light tiles
  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      const L = (await import('leaflet')).default;
      LRef.current = L;

      if (!isMounted) return;

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const initialLat = lastLocation?.lat ?? 28.6315;
        const initialLng = lastLocation?.lng ?? 77.2185;

        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView([initialLat, initialLng], isDone ? 14 : 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        map.on('dragstart', () => {
          followRef.current = false;
          setFollow(false);
        });

        mapInstanceRef.current = map;
        setLeafletLoaded(true);

        // Invalidate size shortly after DOM settle
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 150);
      }
    }

    init();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        destMarkerRef.current = null;
        circleRef.current = null;
        polylineRef.current = null;
        plannedPolylineRef.current = null;
        firstRef.current = true;
      }
    };
  }, []);

  // Window resize handler to maintain map layout
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update Markers, Trail, Planned Guideline, and Destination
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletLoaded || !lastLocation || !LRef.current) return;
    const map = mapInstanceRef.current;
    const leaflet = LRef.current.default || LRef.current;

    const ll: [number, number] = [lastLocation.lat, lastLocation.lng];

    // Traveller Pin styling matching provided HTML
    const pinClass = `pin ${isDone ? 'done' : isEmergency ? 'alert' : isStale ? 'stale' : ''}`;
    const iconHtml = isDone
      ? '<span class="done-dot">✓</span>'
      : '<span class="pulse"></span><span class="dot"></span>';

    const travellerIcon = leaflet.divIcon({
      className: pinClass,
      html: iconHtml,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const color = isDone ? '#4A7C59' : isEmergency ? '#C9574B' : isStale ? '#9A9288' : '#3F8FC6';

    // 1. Current / Arrival Marker
    if (!markerRef.current) {
      markerRef.current = leaflet.marker(ll, { icon: travellerIcon }).addTo(map);
    } else {
      markerRef.current.setLatLng(ll).setIcon(travellerIcon);
    }

    // 2. Accuracy circle
    if (!isDone) {
      if (!circleRef.current) {
        circleRef.current = leaflet.circle(ll, {
          radius: accuracyM ?? 15,
          color,
          weight: 1,
          fillOpacity: 0.12,
        }).addTo(map);
      } else {
        circleRef.current.setLatLng(ll).setRadius(accuracyM ?? 15).setStyle({ color });
      }
    } else if (circleRef.current) {
      map.removeLayer(circleRef.current);
      circleRef.current = null;
    }

    // 3. Travelled Trail Polyline
    const trail = locationHistory.map((p) => [p.lat, p.lng] as [number, number]);
    if (trail.length === 0 || (trail[trail.length - 1][0] !== ll[0] && trail[trail.length - 1][1] !== ll[1])) {
      trail.push(ll);
    }

    if (!polylineRef.current) {
      polylineRef.current = leaflet.polyline(trail, {
        color,
        weight: 4,
        opacity: 0.8,
        lineJoin: 'round',
      }).addTo(map);
    } else {
      polylineRef.current.setLatLngs(trail).setStyle({ color });
    }

    // 4. Destination Marker and Planned Dashed Line
    if (destination) {
      const destLL: [number, number] = [destination.lat, destination.lng];

      if (!destMarkerRef.current) {
        const destIcon = leaflet.divIcon({
          className: 'dest-pin',
          html: '<span class="dest-ring"></span><span class="dest-dot"></span>',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        destMarkerRef.current = leaflet.marker(destLL, { icon: destIcon })
          .addTo(map)
          .bindPopup(`<b>Destination</b><br/>${destinationName}`);
      } else {
        destMarkerRef.current.setLatLng(destLL);
      }

      // Planned guideline towards destination (if not completed)
      if (!isDone) {
        const plannedPoints: [number, number][] = [ll, destLL];
        if (!plannedPolylineRef.current) {
          plannedPolylineRef.current = leaflet.polyline(plannedPoints, {
            color: 'var(--line)',
            weight: 3,
            dashArray: '4 8',
            opacity: 0.7,
          }).addTo(map);
        } else {
          plannedPolylineRef.current.setLatLngs(plannedPoints);
        }
      } else if (plannedPolylineRef.current) {
        map.removeLayer(plannedPolylineRef.current);
        plannedPolylineRef.current = null;
      }
    }

    // 5. Camera positioning
    if (isDone) {
      // Fit all points in view
      const allPoints: [number, number][] = [...trail];
      if (destination) allPoints.push([destination.lat, destination.lng]);
      if (allPoints.length > 1) {
        map.fitBounds(leaflet.latLngBounds(allPoints), {
          padding: [36, 36],
          maxZoom: 16,
          animate: true,
        });
      }
    } else if (firstRef.current) {
      map.setView(ll, 16);
      firstRef.current = false;
    } else if (followRef.current) {
      if (map.getZoom() < 15) {
        map.setView(ll, 16, { animate: true });
      } else {
        map.panTo(ll, { animate: true, duration: 0.6 });
      }
    }
  }, [lastLocation, accuracyM, locationHistory, isEmergency, isStale, destination, destinationName, isDone, leafletLoaded]);

  const recenter = () => {
    followRef.current = true;
    setFollow(true);
    const leaflet = LRef.current?.default || LRef.current;
    if (mapInstanceRef.current && lastLocation && leaflet) {
      if (isDone && destination) {
        const trail = locationHistory.map((p) => [p.lat, p.lng] as [number, number]);
        trail.push([lastLocation.lat, lastLocation.lng]);
        trail.push([destination.lat, destination.lng]);
        mapInstanceRef.current.fitBounds(leaflet.latLngBounds(trail), { padding: [36, 36] });
      } else {
        mapInstanceRef.current.setView(
          [lastLocation.lat, lastLocation.lng],
          Math.max(mapInstanceRef.current.getZoom(), 16),
          { animate: true }
        );
      }
    }
  };

  return (
    <div className="mapw">
      <div ref={mapContainerRef} className="map" />
      {destination && (
        <div className="map-badge">
          {isDone ? '✓ Arrived at destination' : `📍 Destination: ${destinationName}`}
        </div>
      )}
      {!follow && (
        <button className="recenter" onClick={recenter} type="button">
          Recenter
        </button>
      )}
    </div>
  );
};
