import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Boxes, TrendingUp, ShieldAlert, Truck, Sparkles } from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export const MAIN_NAV: readonly NavItem[] = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Inventory", url: "/inventory", icon: Boxes },
  { title: "Forecasting", url: "/forecasting", icon: TrendingUp },
  { title: "Risk Analysis", url: "/risk-analysis", icon: ShieldAlert },
  { title: "Shipments", url: "/shipments", icon: Truck },
  { title: "AI Assistant", url: "/ai-assistant", icon: Sparkles },
] as const;
