import { fetchJson } from "@/services/api";
import type { DemandIntelligence } from "@/types/api";
import type { ForecastPoint } from "@/types/prediction";

export function getDemandIntelligence(): Promise<DemandIntelligence> {
  return fetchJson<DemandIntelligence>("/api/demand-intelligence");
}

export async function getForecast(): Promise<ForecastPoint[]> {
  const data = await getDemandIntelligence();
  return data.forecastSeries;
}
