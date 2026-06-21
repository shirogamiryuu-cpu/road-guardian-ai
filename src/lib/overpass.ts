import type { Poi } from "@/components/MapView";

// Overpass QL query for nearby POIs. Uses public Overpass API.
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export async function fetchNearbyEmergency(
  lat: number,
  lng: number,
  radiusMeters = 5000,
): Promise<Poi[]> {
  const r = radiusMeters;
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${r},${lat},${lng});
      node["amenity"="clinic"](around:${r},${lat},${lng});
      node["amenity"="police"](around:${r},${lat},${lng});
      node["amenity"="fire_station"](around:${r},${lat},${lng});
      node["amenity"="pharmacy"](around:${r},${lat},${lng});
      node["amenity"="fuel"](around:${r},${lat},${lng});
      node["shop"="car_repair"](around:${r},${lat},${lng});
    );
    out body 60;
  `;
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    body: "data=" + encodeURIComponent(query),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  if (!res.ok) throw new Error(`Overpass error ${res.status}`);
  const data = (await res.json()) as {
    elements: Array<{
      id: number;
      lat: number;
      lon: number;
      tags?: Record<string, string>;
    }>;
  };
  return data.elements.map((el) => {
    const t = el.tags ?? {};
    const kind: Poi["kind"] =
      t.amenity === "hospital" || t.amenity === "clinic"
        ? "hospital"
        : t.amenity === "police"
          ? "police"
          : t.amenity === "fire_station"
            ? "fire_station"
            : t.amenity === "pharmacy"
              ? "pharmacy"
              : t.amenity === "fuel"
                ? "fuel"
                : "mechanic";
    return {
      id: String(el.id),
      lat: el.lat,
      lng: el.lon,
      name: t.name || t["name:en"] || titleCase(kind),
      kind,
      phone: t.phone || t["contact:phone"],
    };
  });
}

export async function fetchRoadAtPoint(
  lat: number,
  lng: number,
): Promise<{ name: string; highway: string; lat: number; lng: number } | null> {
  const query = `
    [out:json][timeout:15];
    way(around:25,${lat},${lng})["highway"];
    out tags 1;
  `;
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    body: "data=" + encodeURIComponent(query),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    elements: Array<{ tags?: Record<string, string> }>;
  };
  const el = data.elements[0];
  if (!el?.tags) return null;
  return {
    lat,
    lng,
    name: el.tags.name || el.tags.ref || "Unnamed road",
    highway: el.tags.highway,
  };
}

function titleCase(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Cache last results in localStorage for offline fallback
const CACHE_KEY = "roadshield:last-emergency";
export function cacheEmergency(lat: number, lng: number, pois: Poi[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ lat, lng, pois, ts: Date.now() }));
  } catch {}
}
export function readCachedEmergency(): { lat: number; lng: number; pois: Poi[]; ts: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
