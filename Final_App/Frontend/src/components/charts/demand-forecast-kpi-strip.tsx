import type { LucideIcon } from "lucide-react";
import { Activity, Brain, Gauge, TrendingUp } from "lucide-react";
import type { DemandKpi } from "@/types/api";
import { cn } from "@/lib/utils";

type StripItem = {
  label: string;
  value: string;
  trend: string;
  trendPositive?: boolean;
  icon: LucideIcon;
};

const iconMap: Record<NonNullable<DemandKpi["icon"]>, LucideIcon> = {
  activity: Activity,
  brain: Brain,
  gauge: Gauge,
  trend: TrendingUp,
};

function toStripItem(item: DemandKpi): StripItem {
  return {
    ...item,
    icon: iconMap[item.icon ?? "gauge"],
  };
}

export function DemandForecastKpiStrip({ items }: { items: DemandKpi[] }) {
  const stripItems = items.map(toStripItem);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-3.5 lg:grid-cols-4">
      {stripItems.map((item) => (
        <div
          key={item.label}
          className={cn(
            "group rounded-md border border-border/60 bg-surface-muted/40 px-3.5 py-3 transition-all",
            "hover:border-border hover:bg-surface-muted/70",
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
            <span
              className={cn(
                "text-[10px] font-medium tabular-nums text-muted-foreground",
                item.trendPositive === true && "text-emerald-700 dark:text-emerald-400/90",
              )}
            >
              {item.trend}
            </span>
          </div>
          <p className="mt-2.5 text-lg font-semibold tabular-nums tracking-tight text-foreground">
            {item.value}
          </p>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
