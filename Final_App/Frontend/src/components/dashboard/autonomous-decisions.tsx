import { Bot, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { autonomousDecisions } from "@/mock/dashboard-data";
import { cn } from "@/lib/utils";

const statusMap = {
  executed: { Icon: CheckCircle2, label: "Executed", tone: "bg-emerald-950/45 text-emerald-300" },
  pending: { Icon: Clock, label: "Pending", tone: "bg-amber-950/45 text-amber-200" },
  review: { Icon: ShieldCheck, label: "Review", tone: "bg-muted/80 text-muted-foreground" },
} as const;

export function AutonomousDecisions() {
  return (
    <div className="rounded-md border border-border/70 bg-surface p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-medium text-foreground">AI Decisions</h3>
            <p className="mt-1 text-sm text-muted-foreground">Automated actions from the last hour</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {autonomousDecisions.map((d) => {
          const s = statusMap[d.status];
          return (
            <div
              key={d.id}
              className="rounded-md border border-border/60 bg-surface-muted/40 p-5 transition-colors hover:border-border"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold text-foreground">{d.title}</h4>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                    s.tone
                  )}
                >
                  <s.Icon className="h-3 w-3" />
                  {s.label}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
                <span className="tabular-nums">Confidence {d.confidence}%</span>
                <span>{d.timestamp}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
