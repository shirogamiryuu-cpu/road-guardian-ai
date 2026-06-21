import { useCallback, useEffect, useState } from "react";
import { MapView, type Poi } from "@/components/MapView";
import { ClientOnly } from "@/components/ClientOnly";
import { fetchNearbyEmergency, cacheEmergency, readCachedEmergency } from "@/lib/overpass";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, MapPin, Ambulance, Shield, Wrench, Fuel, Cross, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const EMERGENCY_NUMBERS = [
  { label: "Universal", number: "112", icon: AlertTriangle },
  { label: "Ambulance", number: "108", icon: Ambulance },
  { label: "Police", number: "100", icon: Shield },
  { label: "Highway", number: "1073", icon: MapPin },
];

const KIND_ICON = {
  hospital: Cross,
  police: Shield,
  fire_station: AlertTriangle,
  pharmacy: Cross,
  fuel: Fuel,
  mechanic: Wrench,
} as const;

const INDIA_CENTER: [number, number] = [20.5937, 78.9629];

export function SosPanel({ compact = false }: { compact?: boolean }) {
  const [loc, setLoc] = useState<[number, number] | null>(null);
  const [pois, setPois] = useState<Poi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const activate = useCallback(async () => {
    setError(null);
    setLoading(true);
    setOffline(false);

    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported by this browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const here: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setLoc(here);
        try {
          const result = await fetchNearbyEmergency(here[0], here[1]);
          setPois(result);
          cacheEmergency(here[0], here[1], result);
        } catch {
          const cached = readCachedEmergency();
          if (cached) {
            setPois(cached.pois);
            setOffline(true);
          } else {
            setError("Could not fetch nearby services. Please try again.");
          }
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError("Location denied. Allow location access to find help nearby.");
        setLoading(false);
        // Try cached
        const cached = readCachedEmergency();
        if (cached) {
          setLoc([cached.lat, cached.lng]);
          setPois(cached.pois);
          setOffline(true);
        }
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  // Load cache on mount
  useEffect(() => {
    const cached = readCachedEmergency();
    if (cached) {
      setLoc([cached.lat, cached.lng]);
      setPois(cached.pois);
    }
  }, []);

  const smsBody = loc
    ? `EMERGENCY. I need help. My location: https://www.openstreetmap.org/?mlat=${loc[0]}&mlon=${loc[1]}#map=18/${loc[0]}/${loc[1]}`
    : "EMERGENCY. I need help.";

  return (
    <div className={cn("grid gap-4", compact ? "grid-cols-1" : "lg:grid-cols-[1fr_360px]")}>
      <div className={cn("relative", compact ? "h-[420px]" : "h-[calc(100vh-220px)] min-h-[480px]")}>
        <ClientOnly
          fallback={
            <div className="h-full w-full rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground text-sm">
              Loading map…
            </div>
          }
        >
          <MapView
            center={loc ?? INDIA_CENTER}
            userLocation={loc}
            pois={pois}
            className="h-full w-full rounded-xl overflow-hidden border border-border"
          />
        </ClientOnly>

        {/* Floating SOS button */}
        <button
          onClick={activate}
          disabled={loading}
          className="sos-pulse absolute bottom-6 left-6 z-[500] flex h-20 w-20 items-center justify-center rounded-full bg-sos text-sos-foreground text-lg font-bold tracking-wider shadow-xl disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "SOS"}
        </button>
      </div>

      <aside className="space-y-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Golden Hour Mode
            </div>
            {offline && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary bg-primary/15 px-2 py-0.5 rounded">
                offline cache
              </span>
            )}
          </div>
          <p className="text-sm leading-snug mb-3">
            Tap SOS to share your location and find the nearest help.
          </p>
          {error && <div className="text-xs text-destructive mb-2">{error}</div>}
          <div className="grid grid-cols-2 gap-2">
            {EMERGENCY_NUMBERS.map((e) => (
              <a
                key={e.number}
                href={`tel:${e.number}`}
                className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 hover:bg-secondary"
              >
                <e.icon className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none">
                    {e.label}
                  </div>
                  <div className="text-sm font-mono font-bold">{e.number}</div>
                </div>
              </a>
            ))}
          </div>
          {loc && (
            <a
              href={`sms:?body=${encodeURIComponent(smsBody)}`}
              className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm font-medium"
            >
              <Phone className="h-4 w-4" /> Send live location via SMS
            </a>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4 max-h-[420px] overflow-y-auto">
          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
            Nearby ({pois.length})
          </div>
          {pois.length === 0 ? (
            <div className="text-xs text-muted-foreground">Tap SOS to find hospitals, police, ambulance & more around you.</div>
          ) : (
            <ul className="space-y-1.5">
              {pois.slice(0, 30).map((p) => {
                const Icon = KIND_ICON[p.kind];
                return (
                  <li key={p.id} className="flex items-start gap-2.5 rounded-md hover:bg-secondary/40 p-2">
                    <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{p.name}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                        {p.kind.replace("_", " ")}
                      </div>
                    </div>
                    {p.phone && (
                      <a href={`tel:${p.phone}`} className="text-xs text-primary font-mono">
                        call
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
