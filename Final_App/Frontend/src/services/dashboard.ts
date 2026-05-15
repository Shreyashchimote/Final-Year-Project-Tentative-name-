import { fetchJson } from "@/services/api";
import type {
  DashboardSummary,
  MonthlyLogisticsResponse,
  RevenueTrendsResponse,
} from "@/types/api";

export function getDashboardSummary(): Promise<DashboardSummary> {
  return fetchJson<DashboardSummary>("/api/dashboard-summary");
}

export function getMonthlyLogistics(): Promise<MonthlyLogisticsResponse> {
  return fetchJson<MonthlyLogisticsResponse>("/api/monthly-logistics");
}

export function getRevenueTrends(): Promise<RevenueTrendsResponse> {
  return fetchJson<RevenueTrendsResponse>("/api/revenue-trends");
}
