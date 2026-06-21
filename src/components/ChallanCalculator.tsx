import { useState } from "react";
import { VIOLATIONS, INDIAN_STATES, computeChallan } from "@/lib/india-laws";
import { Button } from "@/components/ui/button";
import { Calculator, Receipt, Shield, AlertTriangle } from "lucide-react";

export function ChallanCalculator() {
  const [violationId, setViolationId] = useState(VIOLATIONS[0].id);
  const [state, setState] = useState<string>("Tamil Nadu");
  const result = computeChallan(violationId, state);

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="rounded-xl border border-border bg-card p-5 space-y-4 h-fit"
      >
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Challan Calculator</h2>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Violation
          </label>
          <select
            value={violationId}
            onChange={(e) => setViolationId(e.target.value)}
            className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm"
          >
            {VIOLATIONS.map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            State
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm"
          >
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Fines per MV (Amendment) Act 2019 + state notifications. For reference only — final penalty is at the enforcing officer's discretion.
        </p>
      </form>

      {result && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                Estimated penalty
              </div>
              <div className="text-4xl font-bold font-mono text-primary">
                ₹{result.fineINR.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {result.violation.section}
                {result.isStateOverride && (
                  <span className="ml-2 text-primary">· {state} rate</span>
                )}
              </div>
            </div>
            <Receipt className="h-8 w-8 text-muted-foreground" />
          </div>

          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
              Violation
            </div>
            <div className="text-base font-medium">{result.violation.label}</div>
            <p className="text-sm text-muted-foreground mt-1">{result.violation.description}</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            {result.violation.repeatFine && (
              <Stat label="Repeat offence" value={`₹${result.violation.repeatFine.toLocaleString("en-IN")}`} />
            )}
            {result.violation.imprisonment && (
              <Stat label="Imprisonment" value={result.violation.imprisonment} />
            )}
            {result.violation.licenseImpact && (
              <Stat label="Licence impact" value={result.violation.licenseImpact} />
            )}
          </div>

          {result.note && (
            <div className="flex gap-2 rounded-lg bg-primary/10 border border-primary/30 px-3 py-2 text-xs">
              <AlertTriangle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>{result.note}</span>
            </div>
          )}

          <div className="rounded-lg bg-secondary/40 border border-border p-3">
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-primary mb-1.5">
              <Shield className="h-3.5 w-3.5" /> How to avoid it
            </div>
            <p className="text-sm">{result.violation.prevention}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-sm mt-1">{value}</div>
    </div>
  );
}
