interface ThemeToggleProps {
  theme: "dark" | "light";
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg bg-bg-card border border-border hover:border-accent/50 transition-all"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "\u2600\uFE0F" : "\uD83C\uDF19"}
    </button>
  );
}
