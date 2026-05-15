import type { KpiMetric } from "@/types/dashboard";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { cn } from "@/lib/utils";

export function KpiGrid({ metrics, className }: { metrics: KpiMetric[]; className?: string }) {
  return (
    <div
      className={cn(
        "grid h-full min-h-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 [&>*]:min-h-0",
        className
      )}
    >
      {metrics.map((m) => (
        <KpiCard key={m.id} metric={m} />
      ))}
    </div>
  );
}