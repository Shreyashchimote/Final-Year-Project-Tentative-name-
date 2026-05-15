import { useQuery } from "@tanstack/react-query";
import type { ActivityEvent } from "@/types/dashboard";
import { getDashboardSummary } from "@/services/dashboard";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/common/data-state";
import { cn } from "@/lib/utils";

const styles = {
  success: { dot: "bg-emerald-500" },
  warning: { dot: "bg-amber-500" },
  info: { dot: "bg-slate-400" },
  error: { dot: "bg-destructive" },
} as const;

export function ActivityPanel({
  events: overrideEvents,
  variant = "default",
  previewCount,
}: {
  events?: ActivityEvent[];
  variant?: "default" | "compact";
  /** When set, only the first N events are shown. */
  previewCount?: number;
}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
    enabled: !overrideEvents,
    staleTime: 60_000,
  });
  const events = overrideEvents ?? data?.activityFeed ?? [];

  const list = previewCount != null ? events.slice(0, previewCount) : events;

  if (!overrideEvents && isLoading) return <LoadingBlock />;
  if (!overrideEvents && error) return <ErrorBlock error={error} onRetry={() => refetch()} />;
  if (!list.length) return <EmptyBlock label="No activity returned" />;

  return (
    <div className="rounded-md border border-border/70 bg-surface">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <h3 className="text-lg font-medium text-foreground">Agent activity</h3>
        <span className="text-xs text-muted-foreground">
          {variant === "compact" ? "Recent" : "Event log"}
        </span>
      </div>
      <ol className="relative px-5 py-4">
        <span className="absolute bottom-6 left-[21px] top-6 w-px bg-border/60" />
        {list.map((e) => {
          const s = styles[e.status];
          return (
            <li key={e.id} className="relative pb-5 pl-8 last:pb-0">
              <span
                className={cn(
                  "absolute left-[15px] top-1.5 h-2 w-2 rounded-full ring-4 ring-surface",
                  s.dot,
                )}
              />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">{e.agent}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{e.action}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{e.timestamp}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
