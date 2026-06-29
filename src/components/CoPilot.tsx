import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Mic, MicOff, MapPin, Navigation, AlertTriangle, Car, Phone, BedDouble,
  CloudRain, Mountain, Construction, AlertOctagon, Play, RotateCcw, Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "input" | "gate" | "map" | "lockout";
type Route = { id: string; label: string; city: string };

const QUICK_ROUTES: Route[] = [
  { id: "ny", label: "Times Square → JFK Airport", city: "New York" },
  { id: "hk", label: "Central → HK Intl Airport", city: "Hong Kong" },
];

type Hazard = {
  id: string;
  label: string;
  icon: typeof CloudRain;
  coach: (city: string) => string;
};

const HAZARDS: Hazard[] = [
  {
    id: "rain",
    label: "Heavy Rain / Flood",
    icon: CloudRain,
    coach: (c) => `Heads up. Heavy rainfall detected on your route in ${c}. Reduce speed by twenty percent, increase following distance, and switch on low-beam headlights. Re-routing you to a higher elevation safe haven now.`,
  },
  {
    id: "landslide",
    label: "Mountain Rift / Landslide",
    icon: Mountain,
    coach: (c) => `Caution. A landslide risk has been reported along the mountain pass in ${c}. Avoid the original path. Stay calm, follow the highlighted detour, and keep both hands firmly on the wheel.`,
  },
  {
    id: "construction",
    label: "Acute Construction",
    icon: Construction,
    coach: (c) => `Construction zone ahead in ${c}. Workers may be present. Slow down to thirty kilometers per hour and merge left. A safer parallel route is being drawn now.`,
  },
  {
    id: "crash",
    label: "Severe Gridlock Crash",
    icon: AlertOctagon,
    coach: (c) => `Major accident reported on your current route in ${c}. Expect total gridlock. Take the next exit. Re-routing through a clear arterial road.`,
  },
];

export function CoPilot() {
  const [phase, setPhase] = useState<Phase>("input");
  const [destination, setDestination] = useState("");
  const [city, setCity] = useState("New York");
  const [listening, setListening] = useState(false);
  const recogRef = useRef<any>(null);

  // Voice recognition for text input
  function toggleListen() {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition not supported in this browser. Use Chrome.");
      return;
    }
    if (listening) {
      recogRef.current?.stop();
      setListening(false);
      return;
    }
    const r = new SR();
    r.lang = "en-US";
    r.interimResults = false;
    r.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setDestination((d) => (d ? d + " " : "") + t);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recogRef.current = r;
    r.start();
    setListening(true);
  }

  function pickRoute(r: Route) {
    setDestination(r.label);
    setCity(r.city);
  }

  function startGate() {
    if (!destination.trim()) return;
    setPhase("gate");
  }

  return (
    <div className="relative">
      {phase === "input" && (
        <InputPhase
          destination={destination}
          setDestination={setDestination}
          city={city}
          setCity={setCity}
          listening={listening}
          toggleListen={toggleListen}
          pickRoute={pickRoute}
          onContinue={startGate}
        />
      )}
      {phase === "gate" && (
        <GatePhase
          onPass={() => setPhase("map")}
          onFail={() => setPhase("lockout")}
        />
      )}
      {phase === "map" && <MapPhase city={city} destination={destination} />}
      {phase === "lockout" && <Lockout onReset={() => setPhase("input")} />}

      {phase !== "input" && phase !== "lockout" && (
        <button
          onClick={() => setPhase("input")}
          className="absolute top-2 right-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" /> reset
        </button>
      )}
    </div>
  );
}

/* ----------------------------- PHASE 1 ----------------------------- */
function InputPhase({
  destination, setDestination, city, setCity,
  listening, toggleListen, pickRoute, onContinue,
}: {
  destination: string; setDestination: (s: string) => void;
  city: string; setCity: (s: string) => void;
  listening: boolean; toggleListen: () => void;
  pickRoute: (r: Route) => void; onContinue: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary">◆ Phase 01 · Geographic Input</div>
        <h2 className="mt-1 text-xl font-bold">Where are you driving tonight?</h2>
        <p className="text-sm text-muted-foreground mt-1">Voice-first co-pilot. Speak or type your destination.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        {QUICK_ROUTES.map((r) => (
          <button
            key={r.id}
            onClick={() => pickRoute(r)}
            className={cn(
              "text-left rounded-xl border p-3 transition-colors",
              city === r.city
                ? "border-primary bg-primary/10"
                : "border-border bg-secondary/30 hover:bg-secondary/60",
            )}
          >
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{r.city}</div>
            <div className="text-sm font-medium mt-1 flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5 text-primary" /> {r.label}
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Destination</label>
        <div className="flex gap-2">
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Marina Bay Sands, Singapore"
            className="flex-1 bg-secondary/40 border border-border rounded-lg px-3 py-2.5 text-sm"
          />
          <Button
            type="button"
            variant={listening ? "destructive" : "secondary"}
            onClick={toggleListen}
            className="shrink-0"
          >
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            <span className="ml-1.5 text-xs">{listening ? "Listening…" : "Dictate"}</span>
          </Button>
        </div>
        <div className="flex gap-2">
          {["New York", "Hong Kong", "Singapore", "Mumbai"].map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider border",
                city === c ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={onContinue}
        disabled={!destination.trim()}
        className="w-full h-12 text-sm font-semibold"
      >
        <Play className="h-4 w-4 mr-2" /> Begin Safety Check
      </Button>
    </div>
  );
}

/* ----------------------------- PHASE 2 ----------------------------- */
function GatePhase({ onPass, onFail }: { onPass: () => void; onFail: () => void }) {
  const [mode, setMode] = useState<"choose" | "voice" | "game">("choose");

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-sos">◆ Phase 02 · Safety Gatekeeper</div>
        <h2 className="mt-1 text-xl font-bold">Quick sobriety check</h2>
        <p className="text-sm text-muted-foreground mt-1">Pick one. Pass it and we unlock the route.</p>
      </div>

      {mode === "choose" && (
        <div className="grid sm:grid-cols-2 gap-3">
          <ChoiceCard
            title="Voice Capture"
            desc="Record 5 seconds of speech to verify clarity."
            icon={<Mic className="h-5 w-5" />}
            onClick={() => setMode("voice")}
          />
          <ChoiceCard
            title="Reaction Challenge"
            desc="Tap the yellow target 3 times in 5 seconds."
            icon={<Car className="h-5 w-5" />}
            onClick={() => setMode("game")}
          />
        </div>
      )}

      {mode === "voice" && <VoiceCapture onPass={onPass} onFail={onFail} onBack={() => setMode("choose")} />}
      {mode === "game" && <ReactionGame onPass={onPass} onFail={onFail} onBack={() => setMode("choose")} />}

      <div className="pt-3 border-t border-border">
        <button
          onClick={onFail}
          className="text-xs font-mono uppercase tracking-wider text-sos/80 hover:text-sos inline-flex items-center gap-1.5"
        >
          <AlertTriangle className="h-3.5 w-3.5" /> Force-fail (demo lockout)
        </button>
      </div>
    </div>
  );
}

function ChoiceCard({ title, desc, icon, onClick }: { title: string; desc: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl border border-border bg-secondary/30 p-4 hover:bg-secondary/60 hover:border-primary transition-colors"
    >
      <div className="flex items-center gap-2 text-primary">{icon}<span className="text-sm font-semibold">{title}</span></div>
      <p className="text-xs text-muted-foreground mt-2">{desc}</p>
    </button>
  );
}

function VoiceCapture({ onPass, onFail, onBack }: { onPass: () => void; onFail: () => void; onBack: () => void }) {
  const [state, setState] = useState<"idle" | "recording" | "done">("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        setState("done");
        stream.getTracks().forEach((t) => t.stop());
      };
      recRef.current = rec;
      rec.start();
      setState("recording");
      setTimeout(() => rec.state === "recording" && rec.stop(), 5000);
    } catch {
      alert("Microphone access denied.");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Voice capture · 5s</span>
        <button onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground">← back</button>
      </div>
      {state === "idle" && (
        <Button onClick={start} className="w-full"><Mic className="h-4 w-4 mr-2" /> Start recording</Button>
      )}
      {state === "recording" && (
        <div className="text-center py-6">
          <div className="inline-block h-16 w-16 rounded-full bg-sos/20 border-2 border-sos animate-pulse flex items-center justify-center">
            <Mic className="h-7 w-7 text-sos" />
          </div>
          <div className="text-sm mt-3 font-mono">Recording… say "I am ready to drive safely."</div>
        </div>
      )}
      {state === "done" && audioUrl && (
        <>
          <audio src={audioUrl} controls className="w-full" />
          <div className="grid grid-cols-2 gap-2">
            <Button variant="default" onClick={onPass}>Pass — voice clear</Button>
            <Button variant="destructive" onClick={onFail}>Fail — slurred</Button>
          </div>
        </>
      )}
    </div>
  );
}

function ReactionGame({ onPass, onFail, onBack }: { onPass: () => void; onFail: () => void; onBack: () => void }) {
  const [running, setRunning] = useState(false);
  const [hits, setHits] = useState(0);
  const [time, setTime] = useState(5);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!running) return;
    const tick = setInterval(() => setTime((t) => t - 0.1), 100);
    const move = setInterval(() => {
      const box = boxRef.current?.getBoundingClientRect();
      if (!box) return;
      setPos({
        x: Math.random() * Math.max(box.width - 56, 10),
        y: Math.random() * Math.max(box.height - 56, 10),
      });
    }, 700);
    return () => { clearInterval(tick); clearInterval(move); };
  }, [running]);

  useEffect(() => {
    if (running && time <= 0) {
      setRunning(false);
      if (hits >= 3) onPass(); else onFail();
    }
  }, [time, running, hits, onPass, onFail]);

  function start() {
    setHits(0); setTime(5); setRunning(true);
  }

  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Tap target · 3 hits in 5s</span>
        <button onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground">← back</button>
      </div>
      <div className="flex items-center justify-between text-sm font-mono">
        <span>Hits: <span className="text-primary font-bold">{hits}/3</span></span>
        <span>Time: <span className="text-sos font-bold">{Math.max(0, time).toFixed(1)}s</span></span>
      </div>
      <div
        ref={boxRef}
        className="relative h-56 rounded-lg bg-background border border-border overflow-hidden"
      >
        {!running ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button onClick={start}><Play className="h-4 w-4 mr-2" /> Start challenge</Button>
          </div>
        ) : (
          <button
            onClick={() => setHits((h) => h + 1)}
            style={{ left: pos.x, top: pos.y, transition: "left .25s, top .25s" }}
            className="absolute h-14 w-14 rounded-full bg-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.7)] hover:scale-110 active:scale-95"
            aria-label="target"
          />
        )}
      </div>
    </div>
  );
}

/* ----------------------------- PHASE 3 ----------------------------- */
function MapPhase({ city, destination }: { city: string; destination: string }) {
  const [progress, setProgress] = useState(0);
  const [hazard, setHazard] = useState<Hazard | null>(null);
  const [rerouted, setRerouted] = useState(false);

  // Animate car along path
  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => (p + 0.004) % 1);
    }, 50);
    return () => clearInterval(id);
  }, []);

  function triggerHazard(h: Hazard) {
    setHazard(h);
    setRerouted(true);
    try {
      const u = new SpeechSynthesisUtterance(h.coach(city));
      u.rate = 0.95;
      u.pitch = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {}
  }

  function clearHazard() {
    window.speechSynthesis.cancel();
    setHazard(null);
    setRerouted(false);
  }

  // Original path: smooth curve. Detour: alternate curve.
  const pathOrig = "M 40 220 Q 200 60 380 200 T 720 80";
  const pathDetour = "M 40 220 Q 180 280 320 240 T 720 80";
  const car = pointOnPath(rerouted ? pathDetour : pathOrig, progress);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary">◆ Phase 03 · Live Co-Pilot</div>
            <div className="text-sm font-semibold mt-0.5 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" /> {city} · {destination}
            </div>
          </div>
          {rerouted && (
            <button onClick={clearHazard} className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground">
              clear hazard
            </button>
          )}
        </div>
        <div className="relative rounded-xl overflow-hidden bg-background border border-border">
          <svg viewBox="0 0 760 300" className="w-full h-[280px]">
            {/* grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.4" />
              </pattern>
            </defs>
            <rect width="760" height="300" fill="url(#grid)" />

            {/* original */}
            <path
              d={pathOrig}
              fill="none"
              stroke={rerouted ? "hsl(var(--muted-foreground))" : "hsl(var(--primary))"}
              strokeWidth={rerouted ? 2 : 3}
              strokeDasharray="6 6"
              opacity={rerouted ? 0.3 : 1}
            />
            {/* detour */}
            {rerouted && (
              <path
                d={pathDetour}
                fill="none"
                stroke="#facc15"
                strokeWidth="3"
                strokeDasharray="8 4"
              />
            )}

            {/* origin */}
            <circle cx="40" cy="220" r="8" fill="hsl(var(--primary))" />
            <text x="50" y="244" fill="hsl(var(--muted-foreground))" fontSize="10" fontFamily="monospace">START</text>

            {/* dest */}
            <circle cx="720" cy="80" r="8" fill="hsl(var(--primary))" />
            <text x="660" y="70" fill="hsl(var(--muted-foreground))" fontSize="10" fontFamily="monospace">DEST</text>

            {/* SafeHaven waypoint */}
            {rerouted && (
              <g>
                <circle cx="320" cy="240" r="14" fill="#facc15" opacity="0.25">
                  <animate attributeName="r" values="14;22;14" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="320" cy="240" r="8" fill="#facc15" />
                <text x="338" y="244" fill="#facc15" fontSize="10" fontFamily="monospace" fontWeight="bold">SAFE HAVEN</text>
              </g>
            )}

            {/* car node */}
            <g transform={`translate(${car.x},${car.y})`}>
              <circle r="11" fill="hsl(var(--primary))" opacity="0.3" />
              <circle r="6" fill="hsl(var(--primary))" />
            </g>
          </svg>

          {hazard && (
            <div className="absolute top-3 left-3 right-3 rounded-lg bg-sos/15 border border-sos/40 px-3 py-2 flex items-start gap-2">
              <Volume2 className="h-4 w-4 text-sos mt-0.5 shrink-0 animate-pulse" />
              <div className="text-xs">
                <div className="font-mono uppercase tracking-wider text-sos">Voice coaching active</div>
                <div className="mt-0.5">{hazard.coach(city)}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground mb-2">
          ◆ Threat Injector · tap to simulate
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {HAZARDS.map((h) => {
            const Icon = h.icon;
            const active = hazard?.id === h.id;
            return (
              <button
                key={h.id}
                onClick={() => triggerHazard(h)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors",
                  active ? "border-sos bg-sos/10" : "border-border bg-secondary/30 hover:bg-secondary/60",
                )}
              >
                <Icon className={cn("h-5 w-5 mb-1.5", active ? "text-sos" : "text-primary")} />
                <div className="text-xs font-medium">{h.label}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function pointOnPath(d: string, t: number): { x: number; y: number } {
  if (typeof document === "undefined") return { x: 40, y: 220 };
  const svgNS = "http://www.w3.org/2000/svg";
  const p = document.createElementNS(svgNS, "path");
  p.setAttribute("d", d);
  const len = p.getTotalLength();
  const pt = p.getPointAtLength(len * t);
  return { x: pt.x, y: pt.y };
}

/* ----------------------------- LOCKOUT ----------------------------- */
function Lockout({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl border-2 border-sos bg-sos/10 p-8 text-center space-y-5">
      <div className="mx-auto h-16 w-16 rounded-full bg-sos/20 border-2 border-sos flex items-center justify-center animate-pulse">
        <AlertTriangle className="h-8 w-8 text-sos" />
      </div>
      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-sos">◆ Lockout engaged</div>
        <h2 className="text-2xl font-bold mt-1">Driving disabled for your safety</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          The sobriety check did not pass. Pick a safe alternative — we'll handle the rest.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto">
        <a
          href="https://m.uber.com/looking"
          target="_blank" rel="noopener"
          className="rounded-xl border-2 border-sos bg-background p-4 hover:bg-secondary/40 transition-colors"
        >
          <Phone className="h-6 w-6 text-sos mx-auto" />
          <div className="text-sm font-semibold mt-2">Call Alternative Driver</div>
          <div className="text-[11px] text-muted-foreground mt-1">Uber · Ola · local rideshare</div>
        </a>
        <a
          href="https://www.google.com/maps/search/hotels+near+me"
          target="_blank" rel="noopener"
          className="rounded-xl border-2 border-sos bg-background p-4 hover:bg-secondary/40 transition-colors"
        >
          <BedDouble className="h-6 w-6 text-sos mx-auto" />
          <div className="text-sm font-semibold mt-2">Locate Local Lodging</div>
          <div className="text-[11px] text-muted-foreground mt-1">Nearest hotels &amp; rest stops</div>
        </a>
      </div>
      <button onClick={onReset} className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground">
        ↺ restart check
      </button>
    </div>
  );
}
