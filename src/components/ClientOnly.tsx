import { useEffect, useState, type ReactNode } from "react";

/** Renders children only after first client render — required for Leaflet (uses window). */
export function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <>{mounted ? children : fallback}</>;
}
