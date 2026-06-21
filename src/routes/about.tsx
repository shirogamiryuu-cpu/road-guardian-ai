import { createFileRoute, Link } from "@tanstack/react-router";
import { ChatDock } from "@/components/ChatDock";
import { Ambulance, Scale, Building2, Wifi, Globe, Bot, Database } from "lucide-react";
import logo from "@/assets/roadshield-logo.png";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About RoadShield AI · Road Safety Hackathon 2026" },
      {
        name: "description",
        content:
          "RoadShield AI unifies emergency response, traffic law, and road accountability for India. Built for the IIT Madras CoERS Road Safety Hackathon 2026.",
      },
      { property: "og:title", content: "About RoadShield AI" },
      {
        property: "og:description",
        content: "One AI co-pilot for emergencies, legal questions, and broken roads. Submission for IIT Madras CoERS 2026.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="mx-auto max-w-4xl px-4 py-12 space-y-12">
        <div>
          <img src={logo} alt="RoadShield AI" width={64} height={64} className="h-16 w-16" />
          <div className="mt-4 text-[10px] font-mono uppercase tracking-[0.3em] text-primary">
            Submission · IIT Madras CoERS Road Safety Hackathon 2026
          </div>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
            One AI co-pilot for Indian roads.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Most teams will pick one problem statement. We built a single command-center that solves all three — emergency response, legal clarity, and public accountability — through an AI chat that takes real actions on a real map.
          </p>
        </div>

        <Slide n={1} title="The problem">
          <p>India loses ~150,000 lives a year to road crashes. Three things are broken: citizens can't find help in the golden hour; nobody knows what a fine actually costs; broken roads have no clear owner. Three apps. Three frustrations.</p>
        </Slide>

        <Slide n={2} title="The system">
          <p>RoadShield AI is one chat-driven map that resolves any question to a real action — call, route, draft, file. Built on the AI SDK, Gemini, Leaflet/OSM, and Lovable Cloud.</p>
          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            <Pill icon={Ambulance} label="RoadSOS" />
            <Pill icon={Scale} label="DriveLegal" />
            <Pill icon={Building2} label="RoadWatch" />
          </div>
        </Slide>

        <Slide n={3} title="RoadSOS — Golden Hour Mode">
          <p>One tap shares your live location and surfaces nearby hospitals, trauma centres, police, ambulance, fuel and mechanics — pulled live from OpenStreetMap. Includes one-tap dial of 112/108/100 and an SMS-fallback location share for low-network conditions. Last result is cached for offline use.</p>
          <Link to="/sos" className="text-primary text-sm hover:underline">Open RoadSOS →</Link>
        </Slide>

        <Slide n={4} title="DriveLegal — Challan Calculator">
          <p>Ask "fine for no helmet in Karnataka?" and the AI runs a real tool call against our curated MV Act 2019 + state amendments dataset. Returns the exact section, base fine, state override, repeat-offence penalty, and how to avoid it.</p>
          <Link to="/legal" className="text-primary text-sm hover:underline">Open DriveLegal →</Link>
        </Slide>

        <Slide n={5} title="RoadWatch — Accountability">
          <p>Click any road. The AI reads its OSM classification (NH/SH/MDR/ODR/Urban), looks up the right authority (NHAI, State PWD, Municipal), shows contractor & budget info, and drafts a complaint email pre-filled with location. Logged publicly so others can see open issues.</p>
          <Link to="/watch" className="text-primary text-sm hover:underline">Open RoadWatch →</Link>
        </Slide>

        <Slide n={6} title="Tech architecture">
          <div className="grid sm:grid-cols-2 gap-3 mt-2 text-sm">
            <TechCard icon={Bot} label="AI Layer" body="Gemini 3 Flash via Lovable AI Gateway with tool-calling: lookup_violation, calculate_challan, route_complaint_authority, list_emergency_numbers." />
            <TechCard icon={Globe} label="Map & Data" body="Leaflet + OpenStreetMap tiles. Overpass API for live POIs and road classification — zero API keys, fully free, global-ready." />
            <TechCard icon={Database} label="Backend" body="TanStack Start server routes + Lovable Cloud (Postgres + RLS) for public complaint log." />
            <TechCard icon={Wifi} label="Offline" body="IndexedDB / localStorage cache of last emergency results. SMS deep-link fallback for no-network scenarios." />
          </div>
        </Slide>

        <Slide n={7} title="Impact & scalability">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Works in every Indian state — and globally with any OSM coverage.</li>
            <li>No app install. Mobile-first PWA. Free to operate.</li>
            <li>Drop-in real data: PMGSY road inventory, NHAI tenders, GHMC contractor lists.</li>
            <li>Built so an NGO, a state RTO, or a citizen volunteer group can fork and deploy in a day.</li>
          </ul>
        </Slide>

        <div className="border-t border-border pt-8 text-center">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">Thank you</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Built for <strong>CoERS RBG Labs, IIT Madras · Road Safety Hackathon 2026</strong>.
          </p>
        </div>
      </section>
      <ChatDock />
    </>
  );
}

function Slide({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-3xl font-bold font-mono text-primary/40">{String(n).padStart(2, "0")}</span>
        <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
      </div>
      <div className="text-sm md:text-base text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </article>
  );
}

function Pill({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-primary" /> {label}
    </div>
  );
}

function TechCard({ icon: Icon, label, body }: { icon: React.ComponentType<{ className?: string }>; label: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/20 p-3">
      <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-primary mb-1">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className="text-xs text-muted-foreground">{body}</p>
    </div>
  );
}
