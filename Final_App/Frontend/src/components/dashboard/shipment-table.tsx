import { useQuery } from "@tanstack/react-query";
import type { ShipmentRecord } from "@/types/prediction";
import { getShipments } from "@/services/shipments";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/common/data-state";
import { cn } from "@/lib/utils";
import { Truck } from "lucide-react";

const statusTone: Record<ShipmentRecord["status"], string> = {
  "On Time": "bg-emerald-950/50 text-emerald-300",
  Delivered: "bg-muted/80 text-muted-foreground",
  Delayed: "bg-amber-950/50 text-amber-200",
  "At Risk": "bg-red-950/45 text-red-300",
};

export function ShipmentTable({
  data: overrideData,
  title = "Active shipments",
}: {
  data?: ShipmentRecord[];
  title?: string;
}) {
  const {
    data: fetchedData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["shipments"],
    queryFn: getShipments,
    enabled: !overrideData,
    staleTime: 60_000,
  });
  const data = overrideData ?? fetchedData ?? [];

  if (!overrideData && isLoading) return <LoadingBlock />;
  if (!overrideData && error) return <ErrorBlock error={error} onRetry={() => refetch()} />;
  if (!data.length) return <EmptyBlock label="No shipments returned" />;

  return (
    <div className="overflow-hidden rounded-md border border-border/70 bg-surface">
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground">{title}</h3>
        </div>
        <span className="text-sm text-muted-foreground">{data.length} rows</span>
      </div>
      <div className="max-h-[min(28rem,52vh)] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-[1] border-b border-border/60 bg-surface text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-6 py-3.5">ID</th>
              <th className="px-6 py-3.5">Lane</th>
              <th className="px-6 py-3.5">Carrier</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">ETA</th>
              <th className="px-6 py-3.5">Progress</th>
              <th className="px-6 py-3.5 text-right">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.map((s) => (
              <tr key={s.id} className="transition-colors hover:bg-muted/30">
                <td className="px-6 py-4 font-mono text-xs text-foreground">{s.id}</td>
                <td className="px-6 py-4 text-xs text-foreground">
                  <span className="font-medium">{s.origin}</span>
                  <span className="mx-1.5 text-muted-foreground">→</span>
                  <span className="font-medium">{s.destination}</span>
                </td>
                <td className="px-6 py-4 text-xs text-muted-foreground">{s.carrier}</td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "inline-flex rounded-md border border-transparent px-2 py-0.5 text-xs font-medium",
                      statusTone[s.status],
                    )}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-muted-foreground">{s.eta}</td>
                <td className="px-6 py-4">
                  <div className="flex max-w-[10rem] items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          s.status === "At Risk"
                            ? "bg-destructive"
                            : s.status === "Delayed"
                              ? "bg-warning"
                              : "bg-primary",
                        )}
                        style={{ width: `${s.progress}%` }}
                      />
                    </div>
                    <span className="w-9 text-right text-xs font-medium tabular-nums text-foreground">
                      {s.progress}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={cn(
                      "text-xs font-semibold tabular-nums",
                      s.riskScore > 60
                        ? "text-destructive"
                        : s.riskScore > 30
                          ? "text-warning-foreground"
                          : "text-emerald-700 dark:text-emerald-400",
                    )}
                  >
                    {s.riskScore}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
