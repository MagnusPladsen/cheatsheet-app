export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-24 gap-1">
      <span className="text-xs text-text-secondary">fetching from github</span>
      <span className="cursor-blink text-accent text-xs">█</span>
    </div>
  );
}
