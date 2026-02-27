import type { Binding } from "../types";
import { KbdBadge } from "./KbdBadge";

interface BindingCardProps {
  binding: Binding;
}

export function BindingCard({ binding }: BindingCardProps) {
  return (
    <div className="card-hover-accent flex items-center gap-3 px-3 py-1.5 bg-bg-card border border-border">
      <KbdBadge keys={binding.key} />
      <p className="flex-1 min-w-0 text-[11px] text-text-secondary truncate">
        {binding.action}
      </p>
      <div className="flex items-center gap-1 shrink-0">
        {binding.mode && (
          <span className="text-[9px] px-1 py-0.5 text-text-muted border border-border">
            {binding.mode}
          </span>
        )}
        {binding.isCustom ? (
          <span className="text-[9px] px-1 py-0.5 text-accent/70 bg-accent-dim">
            cstm
          </span>
        ) : (
          <span className="text-[9px] px-1 py-0.5 text-text-muted bg-bg-secondary">
            dflt
          </span>
        )}
      </div>
    </div>
  );
}
