import { Warehouse } from "lucide-react";
import { warehouseUtilization } from "@/mock/dashboard-data";
import { cn } from "@/lib/utils";

export function WarehouseUtilization() {
  return (
    <div className="rounded-md border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Warehouse className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Warehouse Utilization</h3>
        </div>
        <span className="text-[11px] text-muted-foreground">{warehouseUtilization.length} facilities</span>
      </div>
      <div className="space-y-3 p-5">
        {warehouseUtilization.map((w) => {
          const tone =
            w.utilization > 85 ? "bg-destructive" :
            w.utilization > 75 ? "bg-warning" : "bg-gradient-primary";
          return (
            <div key={w.id}>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-foreground">{w.name}</p>
                  <p className="text-[10px] text-muted-foreground">{w.region} · {w.capacity.toLocaleString()} units</p>
                </div>
                <span className={cn("font-semibold tabular-nums",
                  w.utilization > 85 ? "text-destructive" :
                  w.utilization > 75 ? "text-warning-foreground" : "text-foreground"
                )}>
                  {w.utilization}%
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full rounded-full", tone)} style={{ width: `${w.utilization}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
