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
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-card border border-border hover:border-accent/50 transition-all text-sm text-text-secondary disabled:opacity-50"
    >
      <span className={loading ? "animate-spin" : ""}>↻</span>
      {timeAgo && <span className="text-xs text-text-muted">{timeAgo}</span>}
    </button>
  );
}

function formatTimeAgo(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}
