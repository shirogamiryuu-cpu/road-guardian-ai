import { createFileRoute } from "@tanstack/react-router";
import { SosPanel } from "@/components/SosPanel";
import { ChatDock } from "@/components/ChatDock";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Ambulance, Scale, Building2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RoadShield AI · India's AI Road Safety Co-pilot" },
      {
        name: "description",
        content:
          "One map, three lifelines: instant emergency SOS, traffic law chat, and road transparency. Built for India by RoadShield AI.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-8 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary">
            ◆ Road Safety Hackathon 2026 · IIT Madras CoERS
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl leading-[1.05]">
          The AI co-pilot for India's roads.
          <span className="block text-muted-foreground font-normal mt-2 text-xl md:text-2xl">
            Emergencies, traffic law, and road accountability — on one map.
          </span>
        </h1>

        <div className="mt-6 grid sm:grid-cols-3 gap-3">
          <FeatureCard
            to="/sos"
            icon={Ambulance}
            label="RoadSOS"
            desc="Find hospitals, police & ambulance in the golden hour."
            tone="sos"
          />
          <FeatureCard
            to="/legal"
            icon={Scale}
            label="DriveLegal"
            desc="MV Act fines + Challan Calculator with state overrides."
          />
          <FeatureCard
            to="/watch"
            icon={Building2}
            label="RoadWatch"
            desc="Click any road. See who owns it. File a complaint."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
            Live · Emergency map
          </h2>
          <Link
            to="/sos"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Full SOS view <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <SosPanel compact />
      </section>

      <ChatDock />
    </>
  );
}

function FeatureCard({
  to,
  icon: Icon,
  label,
  desc,
  tone,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  tone?: "sos";
}) {
  return (
    <Link
      to={to as never}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center gap-2">
        <div
          className={
            tone === "sos"
              ? "h-9 w-9 rounded-lg bg-sos/15 text-sos flex items-center justify-center"
              : "h-9 w-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center"
          }
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-sm font-semibold">{label}</div>
        <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition" />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}
