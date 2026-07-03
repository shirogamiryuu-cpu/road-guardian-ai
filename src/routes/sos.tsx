import { createFileRoute } from "@tanstack/react-router";
import { SosPanel } from "@/components/SosPanel";
import { ChatDock } from "@/components/ChatDock";

export const Route = createFileRoute("/sos")({
  head: () => ({
    meta: [
      { title: "RoadSOS · Emergency Map · Lann Pya Kyel" },
      {
        name: "description",
        content:
          "One-tap road emergency: instant access to nearest hospitals, police, ambulance and trauma centres in India. Works offline with cached data.",
      },
      { property: "og:title", content: "RoadSOS — Emergency map for Indian road accidents" },
      {
        property: "og:description",
        content: "Find the nearest help in the golden hour. Tap SOS, share your location, dial 112/108.",
      },
    ],
  }),
  component: SosPage,
});

function SosPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-sos">◆ Module 01 · Emergency Response</div>
          <h1 className="text-3xl font-bold tracking-tight mt-1">RoadSOS — Golden Hour Mode</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Tap the red SOS button to detect your location and find the nearest hospitals, police stations, ambulances, fuel and mechanics around you. Works offline once cached.
          </p>
        </div>
        <SosPanel />
      </section>
      <ChatDock />
    </>
  );
}
