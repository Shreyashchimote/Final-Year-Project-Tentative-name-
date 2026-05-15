import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { ShipmentTable } from "@/components/dashboard/shipment-table";
import { ShipmentChart } from "@/components/charts/shipment-chart";
import { ActivityPanel } from "@/components/dashboard/activity-panel";
import { Truck, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/shipments")({
  head: () => ({
    meta: [
      { title: "Shipments · Nexus SCM" },
      { name: "description", content: "Live shipment tracking, ETA predictions, and route intelligence." },
    ],
  }),
  component: ShipmentsPage,
});

const stats = [
  { label: "In transit", value: "1,284", Icon: Truck, tone: "text-primary bg-primary-soft" },
  { label: "On time", value: "1,221", Icon: CheckCircle2, tone: "text-success bg-success/10" },
  { label: "Delayed", value: "51", Icon: Clock, tone: "text-warning-foreground bg-warning/15" },
  { label: "At risk", value: "12", Icon: AlertTriangle, tone: "text-destructive bg-destructive/10" },
];

function ShipmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Logistics"
        title="Shipments"
        description="Real-time tracking with AI-driven ETA and dynamic re-routing."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-md border border-border bg-surface p-4">
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.tone}`}>
              <s.Icon className="h-4.5 w-4.5" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <ShipmentChart />
      <ShipmentTable title="All Shipments" />
      <ActivityPanel />
    </div>
  );
}
