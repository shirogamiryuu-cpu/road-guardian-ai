import { useEffect, useRef } from "react";
import type * as LType from "leaflet";

export type Poi = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  kind: "hospital" | "police" | "fuel" | "mechanic" | "pharmacy" | "fire_station";
  phone?: string;
};

const KIND_ICON: Record<Poi["kind"], string> = {
  hospital: "🏥",
  police: "👮",
  fuel: "⛽",
  mechanic: "🔧",
  pharmacy: "💊",
  fire_station: "🚒",
};

type Props = {
  center: [number, number];
  userLocation?: [number, number] | null;
  pois?: Poi[];
  onMapClick?: (lat: number, lng: number) => void;
  selectedRoad?: { lat: number; lng: number; name: string } | null;
  className?: string;
};

export function MapView(props: Props) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LType.Map | null>(null);
  const layerRef = useRef<LType.LayerGroup | null>(null);
  const userMarkerRef = useRef<LType.Marker | null>(null);
  const LRef = useRef<typeof LType | null>(null);
  const readyRef = useRef(false);

  const { center, userLocation, pois, onMapClick, selectedRoad, className } = props;

  // dynamic import + init
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("leaflet");
      const L = (mod.default ?? mod) as typeof LType;
      if (cancelled || !mapEl.current || mapRef.current) return;
      LRef.current = L;
      const map = L.map(mapEl.current, {
        center,
        zoom: 13,
        zoomControl: true,
        attributionControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      readyRef.current = true;

      if (onMapClick) {
        map.on("click", (e: LType.LeafletMouseEvent) => onMapClick(e.latlng.lat, e.latlng.lng));
      }

      // initial draw
      drawUser();
      drawPois();
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      readyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // recenter
  useEffect(() => {
    if (mapRef.current && center) mapRef.current.setView(center, mapRef.current.getZoom());
  }, [center]);

  function drawUser() {
    const L = LRef.current;
    if (!L || !mapRef.current) return;
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    if (userLocation) {
      const icon = L.divIcon({
        className: "",
        html: `<div class="rs-marker user">📍</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      userMarkerRef.current = L.marker(userLocation, { icon })
        .addTo(mapRef.current)
        .bindPopup("You are here");
    }
  }
  useEffect(drawUser, [userLocation]);

  function drawPois() {
    const L = LRef.current;
    if (!L || !mapRef.current || !layerRef.current) return;
    layerRef.current.clearLayers();
    (pois ?? []).forEach((p) => {
      const icon = L.divIcon({
        className: "",
        html: `<div class="rs-marker sos">${KIND_ICON[p.kind]}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      const popup = `
        <div style="font-family:inherit;min-width:180px">
          <div style="font-weight:600;margin-bottom:4px">${escapeHtml(p.name)}</div>
          <div style="font-size:12px;opacity:0.7;text-transform:capitalize">${p.kind.replace("_", " ")}</div>
          ${p.phone ? `<a href="tel:${p.phone}" style="color:#22D3EE;display:block;margin-top:6px">📞 ${p.phone}</a>` : ""}
          <a href="https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=18/${p.lat}/${p.lng}" target="_blank" rel="noopener" style="color:#22D3EE;display:block;margin-top:4px">↗ Directions</a>
        </div>`;
      L.marker([p.lat, p.lng], { icon }).addTo(layerRef.current!).bindPopup(popup);
    });
  }
  useEffect(drawPois, [pois]);

  useEffect(() => {
    const L = LRef.current;
    if (!L || !mapRef.current || !selectedRoad) return;
    L.popup()
      .setLatLng([selectedRoad.lat, selectedRoad.lng])
      .setContent(`<strong>${escapeHtml(selectedRoad.name)}</strong>`)
      .openOn(mapRef.current);
  }, [selectedRoad]);

  return <div ref={mapEl} className={className ?? "h-full w-full rounded-xl overflow-hidden border border-border"} />;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
