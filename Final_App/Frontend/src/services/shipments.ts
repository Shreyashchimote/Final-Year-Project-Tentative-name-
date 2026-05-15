import { fetchJson } from "@/services/api";
import type { ShipmentsResponse } from "@/types/api";
import type { ShipmentRecord } from "@/types/prediction";

export function getShipmentAnalytics(): Promise<ShipmentsResponse> {
  return fetchJson<ShipmentsResponse>("/api/shipments");
}

export async function getShipments(): Promise<ShipmentRecord[]> {
  const data = await getShipmentAnalytics();
  return data.shipments;
}
