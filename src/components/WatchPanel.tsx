import { useEffect, useState } from "react";
import { MapView } from "@/components/MapView";
import { ClientOnly } from "@/components/ClientOnly";
import { fetchRoadAtPoint } from "@/lib/overpass";
import { authorityForOsmTags, type RoadAuthority } from "@/lib/india-authorities";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, MapPin, FileText, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const INDIA_CENTER: [number, number] = [20.5937, 78.9629];

// Synthetic transparency data — clearly labeled sample
const SAMPLE_TRANSPARENCY = {
  contractor: "L&T Infrastructure Pvt Ltd",
  budget: "₹ 4.2 Cr",
  lastRelaid: "March 2024",
  warrantyEnds: "March 2027",
  complaints: 7,
};

type Selected = {
  lat: number;
  lng: number;
  name: string;
  highway: string;
  authority: RoadAuthority;
};

export function WatchPanel() {
  const [center, setCenter] = useState<[number, number]>(INDIA_CENTER);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [loading, setLoading] = useState(false);
  const [issue, setIssue] = useState("");
  const [recent, setRecent] = useState<Array<{ id: string; road_name: string; issue_type: string; created_at: string }>>([]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
        () => {},
      );
    }
    void loadRecent();
  }, []);

  async function loadRecent() {
    const { data } = await supabase
      .from("road_complaints")
      .select("id,road_name,issue_type,created_at")
      .order("created_at", { ascending: false })
      .limit(8);
    if (data) setRecent(data);
  }

  async function pickRoad(lat: number, lng: number) {
    setLoading(true);
    try {
      const r = await fetchRoadAtPoint(lat, lng);
      if (!r) {
        toast.error("No road found at that point. Try clicking directly on a road.");
        return;
      }
      setSelected({ ...r, authority: authorityForOsmTags(r.highway) });
    } finally {
      setLoading(false);
    }
  }

  async function submitComplaint() {
    if (!selected || !issue.trim()) return;
    const { error } = await supabase.from("road_complaints").insert({
      road_name: selected.name,
      location_lat: selected.lat,
      location_lng: selected.lng,
      issue_type: "user_report",
      description: issue.trim(),
      authority: selected.authority.authority,
    });
    if (error) {
      toast.error("Could not submit complaint: " + error.message);
      return;
    }
    toast.success("Complaint logged. Opening email draft…");
    const body = encodeURIComponent(
      `To: ${selected.authority.authority}\n\nI wish to report an issue on ${selected.name} (${selected.authority.name}).\n\nLocation: https://www.openstreetmap.org/?mlat=${selected.lat}&mlon=${selected.lng}#map=18/${selected.lat}/${selected.lng}\n\nIssue:\n${issue.trim()}\n\nFiled via Lann Pya Kyel.`
    );
    window.location.href = `mailto:${selected.authority.email}?subject=${encodeURIComponent("Road issue report: " + selected.name)}&body=${body}`;
    setIssue("");
    void loadRecent();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <div className="relative h-[calc(100vh-220px)] min-h-[480px]">
        <ClientOnly
          fallback={
            <div className="h-full w-full rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground text-sm">
              Loading map…
            </div>
          }
        >
          <MapView
            center={center}
            onMapClick={pickRoad}
            selectedRoad={selected}
            className="h-full w-full rounded-xl overflow-hidden border border-border"
          />
        </ClientOnly>
        <div className="absolute top-3 left-3 z-[500] rounded-lg bg-card/90 backdrop-blur border border-border px-3 py-2 text-xs font-mono text-muted-foreground">
          {loading ? (
            <span className="flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin"/> reading road…</span>
          ) : (
            "TAP A ROAD ON THE MAP"
          )}
        </div>
      </div>

      <aside className="space-y-3">
        {selected ? (
          <>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                Road Transparency Card
              </div>
              <div className="text-lg font-semibold">{selected.name}</div>
              <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-primary bg-primary/15 px-2 py-0.5 rounded">
                <MapPin className="h-3 w-3" /> {selected.authority.name} · {selected.highway}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <Cell label="Contractor" value={SAMPLE_TRANSPARENCY.contractor} />
                <Cell label="Budget" value={SAMPLE_TRANSPARENCY.budget} />
                <Cell label="Last relaid" value={SAMPLE_TRANSPARENCY.lastRelaid} />
                <Cell label="Warranty ends" value={SAMPLE_TRANSPARENCY.warrantyEnds} />
                <Cell label="Open complaints" value={String(SAMPLE_TRANSPARENCY.complaints)} />
                <Cell label="Helpline" value={selected.authority.phone} />
              </div>
              <p className="mt-3 text-[10px] text-muted-foreground italic">
                * Contractor / budget data shown is a sample. Production deployment would pull from PMGSY / NHAI open-data APIs.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                <Building2 className="h-3.5 w-3.5" /> Responsible authority
              </div>
              <div className="text-sm font-medium">{selected.authority.authority}</div>
              <p className="text-xs text-muted-foreground mt-1">{selected.authority.description}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href={`tel:${selected.authority.phone}`}
                  className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs hover:bg-secondary"
                >
                  <Phone className="h-3.5 w-3.5 text-primary" /> {selected.authority.phone}
                </a>
                <a
                  href={`mailto:${selected.authority.email}`}
                  className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs hover:bg-secondary truncate"
                >
                  <Mail className="h-3.5 w-3.5 text-primary" /> Email
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                <FileText className="h-3.5 w-3.5" /> File complaint
              </div>
              <textarea
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                rows={3}
                placeholder="Describe the issue (potholes, missing signage, broken streetlight…)"
                className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button onClick={submitComplaint} disabled={!issue.trim()} className="mt-2 w-full">
                <Send className="h-4 w-4" /> Route complaint via AI
              </Button>
              <p className="mt-2 text-[10px] text-muted-foreground">
                Logged publicly + opens an email draft to the correct authority.
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Click any road on the map to see its responsible authority, contractor info, and to file a complaint that's automatically routed.
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
            Recent public complaints
          </div>
          {recent.length === 0 ? (
            <div className="text-xs text-muted-foreground">Be the first to file a public road complaint.</div>
          ) : (
            <ul className="space-y-1.5">
              {recent.map((c) => (
                <li key={c.id} className="text-xs border-b border-border last:border-0 pb-1.5">
                  <div className="font-medium truncate">{c.road_name}</div>
                  <div className="text-muted-foreground font-mono text-[10px]">
                    {new Date(c.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-2">
      <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xs mt-0.5 font-medium">{value}</div>
    </div>
  );
}
