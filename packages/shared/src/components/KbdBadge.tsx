interface KbdBadgeProps {
  keys: string;
}

export function KbdBadge({ keys }: KbdBadgeProps) {
  const segments = keys.split(/,\s*/);

  return (
    <span className="inline-flex items-center gap-0.5 shrink-0">
      {segments.map((segment, si) => (
        <span key={si} className="inline-flex items-center gap-0.5">
          {si > 0 && <span className="text-text-muted text-[11px] mx-0.5">then</span>}
          {segment.split("+").map((part, pi) => (
            <span key={pi} className="inline-flex items-center">
              {pi > 0 && <span className="text-text-muted text-[11px]">+</span>}
              <kbd className="inline-flex items-center justify-center min-w-[1.1rem] px-1 py-px text-[11px] font-medium bg-kbd-bg border border-kbd-border text-accent">
                {part.trim()}
              </kbd>
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
