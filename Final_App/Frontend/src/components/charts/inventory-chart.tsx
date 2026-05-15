import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { inventoryHistory } from "@/mock/forecast-data";

const tooltipStyle = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "none",
};

export function InventoryChart({ height = 300 }: { height?: number }) {
  return (
    <div className="rounded-md border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Inventory Health</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">SKU status, last 7 months</p>
        </div>
      </div>
      <div className="p-3" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={inventoryHistory} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} width={36} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="healthy" stackId="a" fill="var(--color-chart-3)" name="Healthy" radius={[0, 0, 0, 0]} />
            <Bar dataKey="low" stackId="a" fill="var(--color-chart-4)" name="Low" />
            <Bar dataKey="critical" stackId="a" fill="var(--color-chart-5)" name="Critical" />
            <Bar dataKey="overstock" stackId="a" fill="var(--color-chart-2)" name="Overstock" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
