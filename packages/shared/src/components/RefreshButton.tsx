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
      className="flex items-center gap-1.5 px-2 h-7 border border-border text-text-muted hover:text-accent hover:border-accent/20 transition-colors text-[10px] tracking-wider disabled:opacity-30"
    >
      <span className={loading ? "animate-spin" : ""}>↻</span>
      {timeAgo && <span>{timeAgo}</span>}
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
