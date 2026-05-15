import { fetchJson } from "@/services/api";
import type { InventoryResponse } from "@/types/api";
import type { InventoryItem } from "@/types/inventory";

export function getInventoryAnalytics(): Promise<InventoryResponse> {
  return fetchJson<InventoryResponse>("/api/inventory");
}

export async function getInventory(): Promise<InventoryItem[]> {
  const data = await getInventoryAnalytics();
  return data.items;
}
