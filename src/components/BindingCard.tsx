import type { Binding } from "../types";
import { KbdBadge } from "./KbdBadge";

interface BindingCardProps {
  binding: Binding;
}

export function BindingCard({ binding }: BindingCardProps) {
  return (
    <div className="card-hover-accent flex items-start gap-3 px-3 py-2.5 bg-bg-card border border-border transition-colors duration-150">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <KbdBadge keys={binding.key} />
          {binding.mode && (
            <span className="font-mono text-[9px] px-1.5 py-0.5 bg-bg-secondary text-text-muted uppercase tracking-widest border border-border">
              {binding.mode}
            </span>
          )}
          {binding.isCustom ? (
            <span className="font-mono text-[9px] px-1.5 py-0.5 bg-warm-dim text-warm uppercase tracking-widest">
              custom
            </span>
          ) : (
            <span className="font-mono text-[9px] px-1.5 py-0.5 bg-bg-secondary text-text-muted uppercase tracking-widest">
              default
            </span>
          )}
        </div>
        <p className="text-sm text-text-secondary font-body truncate">{binding.action}</p>
      </div>
      {binding.category && (
        <span className="shrink-0 font-mono text-[9px] px-1.5 py-0.5 text-text-muted uppercase tracking-widest">
          {binding.category}
        </span>
      )}
    </div>
  );
}
