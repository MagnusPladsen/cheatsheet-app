interface KbdBadgeProps {
  keys: string;
}

export function KbdBadge({ keys }: KbdBadgeProps) {
  const parts = keys.split(/([+ ])/g).filter((p) => p.trim());

  return (
    <span className="inline-flex items-center gap-0.5 flex-wrap">
      {parts.map((part, i) =>
        part === "+" ? (
          <span key={i} className="text-text-muted text-xs mx-0.5">+</span>
        ) : (
          <kbd
            key={i}
            className="inline-flex items-center justify-center min-w-[1.5rem] px-1.5 py-0.5 text-xs font-mono font-semibold rounded border bg-kbd-bg border-kbd-border text-text-primary shadow-sm"
          >
            {part}
          </kbd>
        )
      )}
    </span>
  );
}
