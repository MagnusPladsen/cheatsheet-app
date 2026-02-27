interface ThemeToggleProps {
  theme: "dark" | "light";
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="w-8 h-8 flex items-center justify-center border border-border text-text-muted hover:text-accent hover:border-accent/30 transition-colors font-mono text-xs"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "LT" : "DK"}
    </button>
  );
}
