"use client";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Loc, Pt } from "@/lib/types";

interface Props { loc?: Loc | null; trail: Pt[]; alert: boolean; stale: boolean }

export default function TrackMap({ loc, trail, alert, stale }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const circle = useRef<L.Circle | null>(null);
  const line = useRef<L.Polyline | null>(null);
  const followRef = useRef(true);
  const first = useRef(true);
  const [follow, setFollow] = useState(true);

  useEffect(() => {
    const m = L.map(el.current!, { zoomControl: false }).setView([20.59, 78.96], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors", maxZoom: 19,
    }).addTo(m);
    L.control.zoom({ position: "bottomright" }).addTo(m);
    m.on("dragstart", () => { followRef.current = false; setFollow(false); });
    map.current = m;
    setTimeout(() => m.invalidateSize(), 100);
    return () => { m.remove(); map.current = null; marker.current = null; circle.current = null; line.current = null; first.current = true; };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m || !loc) return;
    const ll: L.LatLngExpression = [loc.lat, loc.lng];
    const icon = L.divIcon({
      className: `pin ${alert ? "alert" : stale ? "stale" : ""}`,
      html: '<span class="pulse"></span><span class="dot"></span>',
      iconSize: [26, 26], iconAnchor: [13, 13],
    });
    const color = alert ? "#C9574B" : "#4F9BD0";
    if (!marker.current) {
      marker.current = L.marker(ll, { icon }).addTo(m);
      circle.current = L.circle(ll, { radius: loc.accuracy_m ?? 20, color, weight: 1, fillOpacity: 0.12 }).addTo(m);
      line.current = L.polyline([], { color, weight: 4, opacity: 0.7 }).addTo(m);
    }
    marker.current.setLatLng(ll).setIcon(icon);
    circle.current!.setLatLng(ll).setRadius(loc.accuracy_m ?? 20).setStyle({ color });
    line.current!.setLatLngs(trail.map((p) => [p.lat, p.lng] as [number, number])).setStyle({ color });
    if (first.current) { m.setView(ll, 16); first.current = false; }
    else if (followRef.current) m.panTo(ll, { animate: true });
  }, [loc, trail, alert, stale]);

  const recenter = () => {
    followRef.current = true; setFollow(true);
    if (loc) map.current?.setView([loc.lat, loc.lng], Math.max(map.current.getZoom(), 16), { animate: true });
  };

  return (
    <div className="map-wrap">
      <div ref={el} className="map" />
      {!loc && <div className="map-empty">Waiting for first location…</div>}
      {loc && !follow && <button className="recenter" onClick={recenter}>Recenter</button>}
    </div>
  );
}
