import { fetchJson } from "@/services/api";
import type { RegionalPerformance } from "@/types/api";

export function getRegionalPerformance(): Promise<RegionalPerformance> {
  return fetchJson<RegionalPerformance>("/api/regional-performance");
}

export async function getRiskMatrix() {
  const data = await getRegionalPerformance();
  return data.riskMatrix;
}

export async function getRiskTrend() {
  const data = await getRegionalPerformance();
  return data.riskTrend;
}
