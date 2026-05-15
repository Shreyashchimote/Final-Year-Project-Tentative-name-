import { useChatbotStore } from "@/store/chatbot-store";

const SUGGESTIONS = [
  "14-day demand forecast?",
  "Top supplier risks?",
  "SKUs needing replenishment?",
  "Today's AI decisions",
];

export function SuggestionChips() {
  const send = useChatbotStore((s) => s.send);
  return (
    <div className="flex flex-wrap gap-1.5">
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          onClick={() => send(s)}
          className="rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-medium text-foreground transition hover:border-primary/40 hover:bg-primary-soft hover:text-primary"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
