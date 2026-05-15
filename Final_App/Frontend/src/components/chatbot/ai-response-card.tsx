import { Sparkles } from "lucide-react";

interface Props {
  insight: { title: string; points: string[]; confidence: number };
}

export function AIResponseCard({ insight }: Props) {
  return (
    <div className="rounded-md border border-border bg-surface p-3.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        {insight.title}
      </div>
      <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-foreground">
        {insight.points.map((p, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
            {p}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-primary"
            style={{ width: `${insight.confidence}%` }}
          />
        </div>
        <span className="text-[11px] font-semibold text-foreground">{insight.confidence}%</span>
      </div>
    </div>
  );
}
