interface ConfidenceItem {
  label: string;
  score: number;
  detail?: string;
}

const items: ConfidenceItem[] = [
  { label: "Demand model", score: 94, detail: "MAPE 5.9%" },
  { label: "Routing engine", score: 91, detail: "12 agents online" },
  { label: "Risk classifier", score: 87, detail: "AUC 0.93" },
  { label: "Anomaly detection", score: 96, detail: "F1 0.91" },
];

export function AIConfidence() {
  return (
    <div className="rounded-md border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Model Confidence</h3>
        <span className="text-[11px] text-muted-foreground">{items.length} models</span>
      </div>
      <div className="mt-4 space-y-3.5">
        {items.map((it) => (
          <div key={it.label}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{it.label}</span>
              <span className="font-semibold text-foreground">{it.score}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-gradient-primary transition-all" style={{ width: `${it.score}%` }} />
            </div>
            {it.detail && <p className="mt-1 text-[10px] text-muted-foreground">{it.detail}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
