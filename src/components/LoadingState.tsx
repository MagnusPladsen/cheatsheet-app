export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-border" />
        <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin" />
      </div>
      <p className="text-text-muted text-sm animate-pulse">Fetching bindings from GitHub...</p>
    </div>
  );
}
