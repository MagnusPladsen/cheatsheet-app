interface ThemeToggleProps {
  theme: "dark" | "light";
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="px-2 h-7 flex items-center border border-border text-text-muted hover:text-accent hover:border-accent/20 transition-colors text-[10px] tracking-wider"
      aria-label="toggle theme"
    >
      [{theme === "dark" ? "dk" : "lt"}]
    </button>
  );
}
