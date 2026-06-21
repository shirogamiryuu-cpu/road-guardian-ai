import { createFileRoute } from "@tanstack/react-router";
import { ChallanCalculator } from "@/components/ChallanCalculator";
import { ChatDock } from "@/components/ChatDock";
import { VIOLATIONS } from "@/lib/india-laws";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "DriveLegal · MV Act Fines & Challan Calculator · RoadShield AI" },
      {
        name: "description",
        content:
          "Look up Indian traffic fines under the Motor Vehicles (Amendment) Act 2019 with state-specific overrides. Built-in Challan Calculator.",
      },
      { property: "og:title", content: "DriveLegal — Indian traffic fines made clear" },
      {
        property: "og:description",
        content: "MV Act 2019 + state amendments + AI lawyer chat. Know exactly what a violation costs.",
      },
    ],
  }),
  component: LegalPage,
});

function LegalPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary">◆ Module 02 · Legal Engine</div>
          <h1 className="text-3xl font-bold tracking-tight mt-1">DriveLegal — Know what it costs.</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Calculated from the Motor Vehicles (Amendment) Act 2019 with state-level overrides. Ask the chat anything — "fine for no helmet in Karnataka?", "what happens if I drive without insurance?".
          </p>
        </div>
        <ChallanCalculator />

        <div className="mt-10">
          <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
            All violations in dataset
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {VIOLATIONS.map((v) => (
              <div key={v.id} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-sm font-medium">{v.label}</div>
                  <div className="text-xs font-mono text-primary">₹{v.baseFine.toLocaleString("en-IN")}</div>
                </div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">
                  {v.section}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ChatDock />
    </>
  );
}
