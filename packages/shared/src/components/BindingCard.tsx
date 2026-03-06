import type { Binding, MatchInfo } from "../types";
import { KbdBadge } from "./KbdBadge";
import { Tooltip } from "./Tooltip";
import { lc } from "../utils/text";
import { highlightFromMatches } from "../utils/highlightMatches";

interface BindingCardProps {
  binding: Binding;
  matches?: MatchInfo[];
}

function HighlightedText({ text, fieldKey, matches }: { text: string; fieldKey: string; matches?: MatchInfo[] }) {
  const fieldMatch = matches?.find((m) => m.key === fieldKey);
  const chunks = highlightFromMatches(text, fieldMatch?.indices);

  return (
    <>
      {chunks.map((chunk, i) =>
        chunk.highlight ? (
          <mark key={i} className="bg-accent/20 text-accent bg-transparent" style={{ backgroundColor: "var(--color-accent-dim)" }}>
            {chunk.text}
          </mark>
        ) : (
          <span key={i}>{chunk.text}</span>
        )
      )}
    </>
  );
}

export function BindingCard({ binding, matches }: BindingCardProps) {
  return (
    <div className="card-hover-accent flex items-center gap-3 px-3 py-2 bg-bg-card border border-border">
      <KbdBadge keys={binding.key} />
      <Tooltip content={binding.action}>
        <p className="text-sm text-text-secondary truncate leading-snug">
          {matches ? (
            <HighlightedText text={lc(binding.action)} fieldKey="action" matches={matches} />
          ) : (
            lc(binding.action)
          )}
        </p>
      </Tooltip>
      <div className="flex items-center gap-1 shrink-0">
        {binding.mode && (
          <span className="text-[11px] px-1.5 py-0.5 text-text-muted border border-border">
            {lc(binding.mode)}
          </span>
        )}
        {binding.isCustom ? (
          <span className="text-[11px] px-1 py-0.5 text-accent/70 bg-accent-dim">
            {lc("cstm")}
          </span>
        ) : (
          <span className="text-[11px] px-1 py-0.5 text-text-muted bg-bg-secondary">
            {lc("dflt")}
          </span>
        )}
      </div>
    </div>
  );
}
