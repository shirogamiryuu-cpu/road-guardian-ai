import { Link, useRouterState } from "@tanstack/react-router";
import logo from "@/assets/roadshield-logo.png";
import { cn } from "@/lib/utils";

const NAV: { to: string; label: string; end?: boolean }[] = [
  { to: "/", label: "Command", end: true },
  { to: "/sos", label: "RoadSOS" },
  { to: "/legal", label: "DriveLegal" },
  { to: "/watch", label: "RoadWatch" },
  { to: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-[900] border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="RoadShield AI logo" width={28} height={28} className="h-7 w-7" />
          <div className="leading-none">
            <div className="text-sm font-bold tracking-tight">RoadShield AI</div>
            <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
              Road Safety Command
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map((n) => {
            const active = n.end ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to as never}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
