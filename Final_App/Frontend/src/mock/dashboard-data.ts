import type {
  ActivityEvent,
  AIInsight,
  AutonomousDecision,
  KpiMetric,
  WarehouseUtil,
} from "@/types/dashboard";

export const kpiMetrics: KpiMetric[] = [
  { id: "k1", label: "On-Time Delivery", value: "97.4%", delta: 1.8, trend: "up", hint: "vs. prior 7 days" },
  { id: "k2", label: "Forecast Accuracy", value: "94.1%", delta: 0.6, trend: "up", hint: "5.9% avg. error" },
  { id: "k3", label: "Inventory Turns", value: "8.2x", delta: -0.3, trend: "down", hint: "30-day rolling" },
  { id: "k4", label: "Active Shipments", value: "1,284", delta: 4.2, trend: "up", hint: "12 at risk" },
  { id: "k5", label: "Cost / Order", value: "$12.48", delta: -2.1, trend: "up", hint: "AI-optimized" },
  { id: "k6", label: "AI Decisions / hr", value: "342", delta: 11.5, trend: "up", hint: "Fully autonomous" },
];

/** Primary operations overview KPIs (max four). */
export const overviewKpiMetrics: KpiMetric[] = kpiMetrics.filter((m) =>
  ["k1", "k2", "k4", "k6"].includes(m.id)
);

export const activityFeed: ActivityEvent[] = [
  { id: "a1", timestamp: "2m ago", agent: "Forecast", action: "Retrained EU-West demand model — accuracy up 2.1%", status: "success" },
  { id: "a2", timestamp: "6m ago", agent: "Risk", action: "Flagged ACME-2241 — lead time exceeding threshold", status: "warning" },
  { id: "a3", timestamp: "11m ago", agent: "Inventory", action: "Created PO #44120 for SKU-882 (critical stock)", status: "info" },
  { id: "a4", timestamp: "18m ago", agent: "Routing", action: "Re-routed 14 shipments — weather disruption in NA-Central", status: "success" },
  { id: "a5", timestamp: "27m ago", agent: "Anomaly", action: "Unusual draw detected on SKU-1042, Boston DC", status: "warning" },
  { id: "a6", timestamp: "41m ago", agent: "Pricing", action: "Optimized carrier mix on LAX → DFW — saved $4,820", status: "success" },
];

export const aiInsights: AIInsight[] = [
  { id: "i1", title: "Demand surge — North America", summary: "SKU-330 family may rise 18% in 14 days. Consider pre-positioning to Dallas.", impact: "High", confidence: 92, category: "Demand" },
  { id: "i2", title: "Supplier risk — ACME-2241", summary: "Lead times drifting. Recommend dual-sourcing 30% to Vendor B.", impact: "High", confidence: 87, category: "Risk" },
  { id: "i3", title: "Overstock — EU warehouses", summary: "12 SKUs 38 days above target. Reallocation could free $214K.", impact: "Medium", confidence: 81, category: "Inventory" },
];

export const aiInsightsExtended: AIInsight[] = [
  ...aiInsights,
  {
    id: "i4",
    title: "Port congestion — Los Angeles",
    summary: "Dwell time up 6%. Consider routing 8% of westbound volume via Seattle.",
    impact: "Medium",
    confidence: 79,
    category: "Logistics",
  },
  {
    id: "i5",
    title: "Safety stock — Boston DC",
    summary: "4 SKUs can be reduced 9% and still meet 98% fill rate.",
    impact: "Low",
    confidence: 74,
    category: "Inventory",
  },
];

export const autonomousDecisions: AutonomousDecision[] = [
  { id: "d1", title: "Replenish SKU-882", description: "PO issued: 4,200 units to Vendor B (14-day projection).", confidence: 94, status: "executed", timestamp: "11m ago" },
  { id: "d2", title: "Re-route 14 shipments", description: "Bypassed NA-Central weather via Lane-C.", confidence: 89, status: "executed", timestamp: "18m ago" },
  { id: "d3", title: "Promote EU overstock", description: "8% markdown on 12 SKUs — awaiting approval.", confidence: 76, status: "review", timestamp: "32m ago" },
  { id: "d4", title: "Hold PO #44102", description: "Paused — supplier risk above threshold.", confidence: 72, status: "pending", timestamp: "1h ago" },
];

export const warehouseUtilization: WarehouseUtil[] = [
  { id: "w1", name: "Dallas DC", region: "NA-Central", utilization: 82, capacity: 120000 },
  { id: "w2", name: "Newark DC", region: "NA-East", utilization: 67, capacity: 95000 },
  { id: "w3", name: "LAX Hub", region: "NA-West", utilization: 91, capacity: 140000 },
  { id: "w4", name: "Rotterdam", region: "EU-West", utilization: 74, capacity: 180000 },
  { id: "w5", name: "Singapore", region: "APAC", utilization: 88, capacity: 160000 },
];
