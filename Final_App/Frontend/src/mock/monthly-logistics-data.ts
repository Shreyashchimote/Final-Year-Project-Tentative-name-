export type LogisticsStatusKey = "delivered" | "inTransit" | "delayed" | "atRisk" | "returned";

export type LogisticsSlice = {
  key: LogisticsStatusKey;
  name: string;
  value: number;
  operationalNote: string;
};

export type MonthLogisticsEntry = {
  id: string;
  label: string;
  slices: LogisticsSlice[];
  footerInsight: string;
};

/** Month-keyed shipment mix for the overview pie chart (totals vary by month). */
export const monthlyLogisticsByMonth: Record<string, MonthLogisticsEntry> = {
  january: {
    id: "january",
    label: "January",
    footerInsight: "On-time delivery improved 6.2% this month",
    slices: [
      { key: "delivered", name: "Delivered", value: 834, operationalNote: "High confidence" },
      { key: "inTransit", name: "In Transit", value: 231, operationalNote: "Normal utilization" },
      { key: "delayed", name: "Delayed", value: 128, operationalNote: "Medium confidence" },
      { key: "atRisk", name: "At Risk", value: 51, operationalNote: "Low confidence" },
      { key: "returned", name: "Returned", value: 40, operationalNote: "Within SLA" },
    ],
  },
  february: {
    id: "february",
    label: "February",
    footerInsight: "Transit volume normalized after holiday surge",
    slices: [
      { key: "delivered", name: "Delivered", value: 798, operationalNote: "High confidence" },
      { key: "inTransit", name: "In Transit", value: 256, operationalNote: "Medium confidence" },
      { key: "delayed", name: "Delayed", value: 142, operationalNote: "Weather delays, Midwest" },
      { key: "atRisk", name: "At Risk", value: 62, operationalNote: "Medium confidence" },
      { key: "returned", name: "Returned", value: 44, operationalNote: "Stable vs. Jan" },
    ],
  },
  march: {
    id: "march",
    label: "March",
    footerInsight: "Hub dwell time down 3% per carrier scorecards",
    slices: [
      { key: "delivered", name: "Delivered", value: 856, operationalNote: "High confidence" },
      { key: "inTransit", name: "In Transit", value: 218, operationalNote: "High confidence" },
      { key: "delayed", name: "Delayed", value: 104, operationalNote: "Medium confidence" },
      { key: "atRisk", name: "At Risk", value: 48, operationalNote: "Medium confidence" },
      { key: "returned", name: "Returned", value: 36, operationalNote: "Quality holds reduced returns" },
    ],
  },
  april: {
    id: "april",
    label: "April",
    footerInsight: "At-risk shipments down 9% after routing update",
    slices: [
      { key: "delivered", name: "Delivered", value: 812, operationalNote: "High confidence" },
      { key: "inTransit", name: "In Transit", value: 244, operationalNote: "Medium confidence" },
      { key: "delayed", name: "Delayed", value: 118, operationalNote: "Medium confidence" },
      { key: "atRisk", name: "At Risk", value: 55, operationalNote: "Low confidence" },
      { key: "returned", name: "Returned", value: 39, operationalNote: "Within SLA" },
    ],
  },
  may: {
    id: "may",
    label: "May",
    footerInsight: "Delivery share up 2.1 pp week-over-week",
    slices: [
      { key: "delivered", name: "Delivered", value: 889, operationalNote: "High confidence" },
      { key: "inTransit", name: "In Transit", value: 201, operationalNote: "High confidence" },
      { key: "delayed", name: "Delayed", value: 96, operationalNote: "High confidence" },
      { key: "atRisk", name: "At Risk", value: 42, operationalNote: "Medium confidence" },
      { key: "returned", name: "Returned", value: 34, operationalNote: "Below 90-day avg." },
    ],
  },
  june: {
    id: "june",
    label: "June",
    footerInsight: "End-of-quarter volume absorbed, no SLA impact",
    slices: [
      { key: "delivered", name: "Delivered", value: 902, operationalNote: "High confidence" },
      { key: "inTransit", name: "In Transit", value: 228, operationalNote: "Medium confidence" },
      { key: "delayed", name: "Delayed", value: 88, operationalNote: "Medium confidence" },
      { key: "atRisk", name: "At Risk", value: 38, operationalNote: "Medium confidence" },
      { key: "returned", name: "Returned", value: 31, operationalNote: "Within SLA" },
    ],
  },
};

export const logisticsMonthOrder = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
] as const;

export type LogisticsMonthId = (typeof logisticsMonthOrder)[number];
