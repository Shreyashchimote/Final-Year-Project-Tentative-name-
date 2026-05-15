import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { KpiMetric } from "@/types/dashboard";
import { cn } from "@/lib/utils";

export function KpiCard({ metric }: { metric: KpiMetric }) {
  const positive = metric.trend === "up";
  const Icon = metric.trend === "flat" ? Minus : positive ? ArrowUpRight : ArrowDownRight;
  const tone =
    metric.trend === "flat"
      ? "text-muted-foreground bg-muted"
      : positive
        ? "text-emerald-300/95 bg-emerald-950/40"
        : "text-red-300/95 bg-red-950/40";

  return (
    <div className="group flex h-full min-h-[7.5rem] flex-col rounded-md border border-border/60 bg-surface p-6 transition-colors duration-200 hover:border-border">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
            tone,
          )}
        >
          <Icon className="h-3 w-3" />
          {Math.abs(metric.delta)}%
        </span>
      </div>
      <div className="mt-auto pt-4">
        <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
          {metric.value}
        </p>
        {metric.hint && <p className="mt-1 text-sm text-muted-foreground">{metric.hint}</p>}
      </div>
    </div>
  );
}
