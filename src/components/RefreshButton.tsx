interface RefreshButtonProps {
  onRefresh: () => void;
  loading: boolean;
  lastFetched: Date | null;
}

export function RefreshButton({ onRefresh, loading, lastFetched }: RefreshButtonProps) {
  const timeAgo = lastFetched
    ? formatTimeAgo(Date.now() - lastFetched.getTime())
    : null;

  return (
    <button
      onClick={onRefresh}
      disabled={loading}
      className="flex items-center gap-2 px-3 h-8 border border-border text-text-muted hover:text-accent hover:border-accent/30 transition-colors font-mono text-[11px] tracking-wider disabled:opacity-40"
    >
      <span className={loading ? "animate-spin" : ""}>↻</span>
      {timeAgo && <span className="uppercase">{timeAgo}</span>}
    </button>
  );
}

function formatTimeAgo(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h`;
}
