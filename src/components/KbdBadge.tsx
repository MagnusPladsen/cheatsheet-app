interface KbdBadgeProps {
  keys: string;
}

export function KbdBadge({ keys }: KbdBadgeProps) {
  // Split on + and , (for tmux-style "Ctrl+B, R")
  const segments = keys.split(/,\s*/);

  return (
    <span className="inline-flex items-center gap-1 flex-wrap">
      {segments.map((segment, si) => (
        <span key={si} className="inline-flex items-center gap-0.5">
          {si > 0 && <span className="font-mono text-text-muted text-[10px] mx-0.5">then</span>}
          {segment.split("+").map((part, pi) => (
            <span key={pi} className="inline-flex items-center">
              {pi > 0 && <span className="text-text-muted text-[10px] mx-px font-mono">+</span>}
              <kbd className="inline-flex items-center justify-center min-w-[1.25rem] px-1.5 py-0.5 text-[11px] font-mono font-600 bg-kbd-bg border border-kbd-border text-accent tracking-wide">
                {part.trim()}
              </kbd>
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
