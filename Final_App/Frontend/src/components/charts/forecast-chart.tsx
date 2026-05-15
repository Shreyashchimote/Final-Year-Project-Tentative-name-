import { useId, useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { forecastSeries as initialForecastSeries } from "@/mock/forecast-data";
import { useContinuousData } from "@/hooks/useContinuousData";
import type { ForecastPoint } from "@/types/prediction";
import { DemandForecastKpiStrip } from "@/components/charts/demand-forecast-kpi-strip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const CRITICAL_INVENTORY_THRESHOLD = 5400;

type ChartView = "actual" | "forecast" | "confidence" | "combined";

type ChartRow = ForecastPoint & { spread: number };

function enrichData(rows: ForecastPoint[]): ChartRow[] {
  return rows.map((d) => ({ ...d, spread: d.upper - d.lower }));
}

function riskLevel(forecast: number): string {
  if (forecast >= CRITICAL_INVENTORY_THRESHOLD + 200) return "High";
  if (forecast >= CRITICAL_INVENTORY_THRESHOLD) return "Medium";
  return "Low";
}

function deviationPct(p: ForecastPoint): string {
  if (p.actual == null || p.actual === 0) return "—";
  const pct = ((p.forecast - p.actual) / p.actual) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

function formatDemandTick(v: number) {
  if (Math.abs(v) >= 1000) {
    const k = v / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return String(Math.round(v));
}

function formatDemandDetail(n: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
}

function ForecastTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: ChartRow }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  const risk = riskLevel(row.forecast);
  const riskClass =
    risk === "High"
      ? "text-destructive"
      : risk === "Medium"
        ? "text-amber-800 dark:text-amber-300"
        : "text-muted-foreground";

  return (
    <div className="min-w-[200px] rounded-md border border-border/80 bg-surface px-3.5 py-3 text-xs">
      <p className="font-semibold text-foreground">{row.period}</p>
      <dl className="mt-2.5 space-y-1.5 text-[11px]">
        <div className="flex justify-between gap-6">
          <dt className="text-muted-foreground">Actual</dt>
          <dd className="tabular-nums font-medium text-foreground">
            {row.actual != null ? formatDemandDetail(row.actual) : "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className="text-muted-foreground">Forecast</dt>
          <dd className="tabular-nums font-medium text-foreground">{formatDemandDetail(row.forecast)}</dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className="text-muted-foreground">Deviation</dt>
          <dd className="tabular-nums font-medium text-foreground">{deviationPct(row)}</dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className="text-muted-foreground">Risk level</dt>
          <dd className={cn("font-semibold", riskClass)}>{risk}</dd>
        </div>
      </dl>
    </div>
  );
}

export function ForecastChart({ height = 360 }: { height?: number }) {
  const uid = useId().replace(/:/g, "");
  const gradId = `df-confidence-${uid}`;
  const [view, setView] = useState<ChartView>("combined");

  const streamData = useContinuousData("/api/stream/forecasting", { forecastSeries: initialForecastSeries });
  const data = useMemo(() => enrichData(streamData.forecastSeries), [streamData.forecastSeries]);

  const showConfidence = view === "confidence" || view === "combined";
  const showActual = view === "actual" || view === "combined";
  const showForecast = view === "forecast" || view === "combined";

  return (
    <section
      className={cn(
        "rounded-md border border-border/70 bg-surface p-5 sm:p-6",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 space-y-1">
          <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">Demand Forecast</h3>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            10-week projection with confidence bands and inventory risk.
          </p>
        </div>
        <Badge
          variant="outline"
          className="shrink-0 self-start border-border/80 bg-surface-muted/50 px-3 py-1 text-[11px] font-semibold tracking-wide text-foreground"
        >
          Accuracy 94.1%
        </Badge>
      </div>

      <div className="mt-6">
        <DemandForecastKpiStrip />
      </div>

      <div className="mt-6">
        <Tabs value={view} onValueChange={(v) => setView(v as ChartView)}>
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-md bg-muted/60 p-1 sm:grid-cols-4">
            <TabsTrigger value="actual" className="text-xs sm:text-sm">
              Actual
            </TabsTrigger>
            <TabsTrigger value="forecast" className="text-xs sm:text-sm">
              Forecast
            </TabsTrigger>
            <TabsTrigger value="confidence" className="text-xs sm:text-sm">
              Confidence
            </TabsTrigger>
            <TabsTrigger value="combined" className="text-xs sm:text-sm">
              Combined
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-5 rounded-md border border-border/50 bg-surface-muted/25 p-4 sm:p-5">
        <div className="w-full min-w-0" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 12, right: 12, left: 4, bottom: 8 }}
              className="text-muted-foreground"
            >
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.14} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="var(--color-border)"
                strokeDasharray="4 4"
                vertical={false}
                strokeOpacity={0.55}
              />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={44}
                tickFormatter={formatDemandTick}
              />
              <Tooltip
                content={<ForecastTooltip />}
                cursor={{ stroke: "var(--color-border)", strokeWidth: 1, strokeDasharray: "4 4" }}
                animationDuration={200}
              />
              <ReferenceLine
                y={CRITICAL_INVENTORY_THRESHOLD}
                stroke="var(--color-chart-5)"
                strokeDasharray="5 5"
                strokeOpacity={0.65}
                label={{
                  value: "Critical threshold",
                  position: "insideTopRight",
                  fill: "var(--color-muted-foreground)",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              />
              {showConfidence ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stackId="confidence"
                    stroke="none"
                    fill="var(--color-surface)"
                    fillOpacity={0}
                    isAnimationActive
                    animationDuration={420}
                    animationEasing="ease-out"
                  />
                  <Area
                    type="monotone"
                    dataKey="spread"
                    stackId="confidence"
                    stroke="none"
                    fill={`url(#${gradId})`}
                    fillOpacity={1}
                    isAnimationActive
                    animationDuration={420}
                    animationEasing="ease-out"
                  />
                </>
              ) : null}
              {showForecast ? (
                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="Forecasted demand"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 1, stroke: "var(--color-surface)", fill: "var(--color-chart-2)" }}
                  connectNulls={false}
                  isAnimationActive
                  animationDuration={450}
                  animationEasing="ease-out"
                />
              ) : null}
              {showActual ? (
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Actual demand"
                  stroke="var(--color-foreground)"
                  strokeWidth={2.75}
                  strokeOpacity={0.88}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 1, stroke: "var(--color-surface)", fill: "var(--color-foreground)" }}
                  connectNulls={false}
                  isAnimationActive
                  animationDuration={450}
                  animationEasing="ease-out"
                />
              ) : null}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
