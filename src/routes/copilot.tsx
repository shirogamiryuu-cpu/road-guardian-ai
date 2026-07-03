import { createFileRoute } from "@tanstack/react-router";
import { CoPilot } from "@/components/CoPilot";

export const Route = createFileRoute("/copilot")({
  component: CoPilotPage,
});

function CoPilotPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary">◆ Lann Pya Kyel · Co-Pilot</div>
        <h1 className="text-2xl font-bold mt-1">The Guiding Star</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Voice-first proactive co-pilot · sobriety gatekeeper · hazard-aware re-routing.
        </p>
      </div>
      <CoPilot />
    </div>
  );
}
