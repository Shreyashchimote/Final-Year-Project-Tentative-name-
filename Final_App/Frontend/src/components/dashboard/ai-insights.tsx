import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Lightbulb } from "lucide-react";
import type { AIInsight } from "@/types/dashboard";
import { getDashboardSummary } from "@/services/dashboard";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/common/data-state";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const impactTone = {
  High: "bg-red-950/45 text-red-200",
  Medium: "bg-amber-950/40 text-amber-200",
  Low: "bg-muted/80 text-muted-foreground",
} as const;

function InsightRow({ insight, compact }: { insight: AIInsight; compact: boolean }) {
  return (
    <div
      className={cn("border-b border-border/50 last:border-0", compact ? "px-5 py-4" : "px-6 py-5")}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="min-w-0 flex-1 text-sm font-medium leading-snug text-foreground">
          {insight.title}
        </h4>
        <span
          className={cn(
            "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium",
            impactTone[insight.impact],
          )}
        >
          {insight.impact}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{insight.summary}</p>
      {!compact && (
        <p className="mt-2 text-xs text-muted-foreground">Confidence {insight.confidence}%</p>
      )}
    </div>
  );
}

export function AIInsights({
  insights: overrideInsights,
  variant = "default",
  maxPreview = 3,
}: {
  insights?: AIInsight[];
  variant?: "default" | "compact";
  maxPreview?: number;
}) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
    enabled: !overrideInsights,
    staleTime: 60_000,
  });
  const insights = overrideInsights ?? data?.aiInsights ?? [];
  const compact = variant === "compact";
  const preview = insights.slice(0, maxPreview);
  const extra = insights.slice(maxPreview);
  const hasExtra = compact && extra.length > 0;

  if (!overrideInsights && isLoading) return <LoadingBlock />;
  if (!overrideInsights && error) return <ErrorBlock error={error} onRetry={() => refetch()} />;
  if (!insights.length) return <EmptyBlock label="No insights returned" />;

  return (
    <div className="rounded-md border border-border/70 bg-surface">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-medium text-foreground">AI insights</h3>
        </div>
        <span className="text-xs text-muted-foreground">Updated recently</span>
      </div>

      {compact && hasExtra ? (
        <Collapsible open={open} onOpenChange={setOpen}>
          <div>
            {preview.map((i) => (
              <InsightRow key={i.id} insight={i} compact />
            ))}
          </div>
          <CollapsibleContent>
            <div className="border-t border-border/60">
              {extra.map((i) => (
                <InsightRow key={i.id} insight={i} compact />
              ))}
            </div>
          </CollapsibleContent>
          <div className="border-t border-border/60 px-2 py-2">
            <CollapsibleTrigger className="flex w-full items-center justify-center gap-1 rounded-sm py-2 text-sm font-medium text-primary transition-colors hover:bg-muted/60">
              <span>{open ? "Show fewer" : "View all insights"}</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
            </CollapsibleTrigger>
          </div>
        </Collapsible>
      ) : (
        <div>
          {(compact ? preview : insights).map((i) => (
            <InsightRow key={i.id} insight={i} compact={compact} />
          ))}
        </div>
      )}
    </div>
  );
}
