import { createFileRoute } from "@tanstack/react-router";
import { WatchPanel } from "@/components/WatchPanel";
import { ChatDock } from "@/components/ChatDock";

export const Route = createFileRoute("/watch")({
  head: () => ({
    meta: [
      { title: "RoadWatch · Road Transparency & Complaint Router · Lann Pya Kyel" },
      {
        name: "description",
        content:
          "Click any road on the map to see who's responsible, who built it, and file a complaint that the AI routes to the correct Indian authority.",
      },
      { property: "og:title", content: "RoadWatch — Public accountability for Indian roads" },
      {
        property: "og:description",
        content: "Road type, contractor, budget, helpline — and a one-tap complaint that goes to the right desk.",
      },
    ],
  }),
  component: WatchPage,
});

function WatchPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary">◆ Module 03 · Accountability</div>
          <h1 className="text-3xl font-bold tracking-tight mt-1">RoadWatch — Click. Identify. Report.</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Pick any road in India and see its classification (NH / SH / district / municipal), responsible authority, sample contractor data, and file a complaint that the AI routes to the right desk.
          </p>
        </div>
        <WatchPanel />
      </section>
      <ChatDock />
    </>
  );
}
