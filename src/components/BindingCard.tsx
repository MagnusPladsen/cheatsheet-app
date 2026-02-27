import type { Binding } from "../types";
import { KbdBadge } from "./KbdBadge";

interface BindingCardProps {
  binding: Binding;
}

export function BindingCard({ binding }: BindingCardProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-card border border-border hover:border-accent/30 hover:bg-bg-card-hover transition-colors duration-150">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <KbdBadge keys={binding.key} />
          {binding.mode && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-secondary text-text-muted uppercase tracking-wider">
              {binding.mode}
            </span>
          )}
          {binding.isCustom ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-badge-custom/20 text-accent-light font-medium">
              custom
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-badge-default/40 text-text-muted font-medium">
              default
            </span>
          )}
        </div>
        <p className="text-sm text-text-secondary truncate">{binding.action}</p>
      </div>
      {binding.category && (
        <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-bg-secondary text-text-muted">
          {binding.category}
        </span>
      )}
    </div>
  );
}
