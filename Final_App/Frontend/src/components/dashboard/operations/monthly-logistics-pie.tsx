import * as React from "react";
import { Pie, PieChart, Sector, Cell } from "recharts";
import {
  logisticsMonthOrder,
  monthlyLogisticsByMonth,
  type LogisticsSlice,
  type LogisticsMonthId,
} from "@/mock/monthly-logistics-data";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const chartConfig = {
  delivered: {
    label: "Delivered",
    color: "oklch(0.58 0.11 155)",
  },
  inTransit: {
    label: "In Transit",
    color: "oklch(0.55 0.12 250)",
  },
  delayed: {
    label: "Delayed",
    color: "oklch(0.72 0.12 75)",
  },
  atRisk: {
    label: "At Risk",
    color: "oklch(0.58 0.16 25)",
  },
  returned: {
    label: "Returned",
    color: "oklch(0.62 0.02 250)",
  },
} satisfies ChartConfig;

type PieDatum = LogisticsSlice & { fill: string };

function toPieData(slices: LogisticsSlice[]): PieDatum[] {
  return slices.map((s) => ({
    ...s,
    fill: `var(--color-${s.key})`,
  }));
}

function LogisticsActiveShape(props: React.ComponentProps<typeof Sector>) {
  const outer = typeof props.outerRadius === "number" ? props.outerRadius : 0;
  return (
    <Sector
      {...props}
      outerRadius={outer + 7}
      className="transition-[outer-radius] duration-200 ease-out"
      style={{
        filter: "drop-shadow(0 2px 8px oklch(0.2 0.04 250 / 0.14))",
      }}
    />
  );
}

function LogisticsTooltipBody({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload as PieDatum | undefined;
  if (!row) return null;
  const pct = total > 0 ? ((row.value / total) * 100).toFixed(0) : "0";

  return (
    <div className="min-w-[11rem] rounded-md border border-border/70 bg-surface px-3 py-2.5 text-xs">
      <p className="font-semibold text-foreground">{row.name}</p>
      <p className="mt-1.5 tabular-nums text-foreground">
        <span className="font-medium">{row.value.toLocaleString("en-US")}</span>{" "}
        <span className="text-muted-foreground">shipments</span>
      </p>
      <p className="mt-1 text-muted-foreground">
        {pct}% of total
      </p>
      <p className="mt-2 border-t border-border/50 pt-2 text-[11px] leading-snug text-muted-foreground">
        {row.operationalNote}
      </p>
    </div>
  );
}

export function MonthlyLogisticsPie({ className }: { className?: string }) {
  const [monthId, setMonthId] = React.useState<LogisticsMonthId>("january");
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined);

  const entry = monthlyLogisticsByMonth[monthId];
  const data = React.useMemo(() => toPieData(entry.slices), [entry.slices]);
  const total = React.useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

  return (
    <div
      className={cn(
        "flex flex-col rounded-md border border-border/60 bg-surface p-5 transition-colors duration-200 sm:p-6",
        "hover:border-border",
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            Logistics Mix
          </h3>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Shipment status by month.
          </p>
        </div>
        <Select value={monthId} onValueChange={(v) => setMonthId(v as LogisticsMonthId)}>
          <SelectTrigger className="w-full shrink-0 sm:w-[160px]" aria-label="Select month">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {logisticsMonthOrder.map((id) => (
              <SelectItem key={id} value={id}>
                {monthlyLogisticsByMonth[id].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative mt-4 min-h-[220px] flex-1 sm:min-h-[260px]" style={{ overflow: "visible" }}>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-full max-h-[280px] w-full" style={{ overflow: "visible" }}>
          <PieChart key={monthId}>
            <ChartTooltip
              cursor={false}
              wrapperStyle={{ zIndex: 50, pointerEvents: "none", position: "absolute" }}
              allowEscapeViewBox={{ x: true, y: true }}
              content={(props) => (
                <LogisticsTooltipBody active={props.active} payload={props.payload} total={total} />
              )}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={64}
              outerRadius={88}
              paddingAngle={2}
              cornerRadius={4}
              strokeWidth={2}
              stroke="var(--color-surface)"
              activeIndex={activeIndex}
              activeShape={LogisticsActiveShape}
              onMouseEnter={(_, i) => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(undefined)}
              isAnimationActive
              animationBegin={0}
              animationDuration={480}
              animationEasing="ease-out"
            >
              {data.map((d, i) => (
                <Cell
                  key={d.key}
                  fill={d.fill}
                  opacity={activeIndex === undefined || activeIndex === i ? 1 : 0.55}
                  className="transition-opacity duration-200 ease-out"
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        <div
          className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center pb-2"
          aria-hidden
        >
          <div className="text-center">
            <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground sm:text-3xl">
              {total.toLocaleString("en-US")}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Shipments</p>
          </div>
        </div>
      </div>

      <p className="mt-4 border-t border-border/50 pt-4 text-xs leading-relaxed text-muted-foreground">
        {entry.footerInsight}
      </p>
    </div>
  );
}
