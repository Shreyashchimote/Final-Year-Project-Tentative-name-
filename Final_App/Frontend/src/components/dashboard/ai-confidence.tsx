import { useQuery } from "@tanstack/react-query";
import { getDemandIntelligence } from "@/services/forecasting";
import type { ModelConfidence } from "@/types/api";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/common/data-state";

export function AIConfidence({ items: overrideItems }: { items?: ModelConfidence[] }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["demand-intelligence"],
    queryFn: getDemandIntelligence,
    enabled: !overrideItems,
    staleTime: 60_000,
  });
  const items = overrideItems ?? data?.modelConfidence ?? [];

  if (!overrideItems && isLoading) return <LoadingBlock />;
  if (!overrideItems && error) return <ErrorBlock error={error} onRetry={() => refetch()} />;
  if (!items.length) return <EmptyBlock label="No confidence data returned" />;

  return (
    <div className="rounded-md border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Model Confidence</h3>
        <span className="text-[11px] text-muted-foreground">{items.length} models</span>
      </div>
      <div className="mt-4 space-y-3.5">
        {items.map((it) => (
          <div key={it.label}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{it.label}</span>
              <span className="font-semibold text-foreground">{it.score}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-primary transition-all"
                style={{ width: `${it.score}%` }}
              />
            </div>
            {it.detail && <p className="mt-1 text-[10px] text-muted-foreground">{it.detail}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
