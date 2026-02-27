export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-1 h-8 bg-accent/30"
            style={{
              animation: "pulse 1s ease-in-out infinite",
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>
      <p className="font-mono text-[11px] text-text-muted tracking-widest uppercase">
        fetching from github...
      </p>
    </div>
  );
}
