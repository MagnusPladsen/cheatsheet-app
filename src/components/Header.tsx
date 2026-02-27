import { ThemeToggle } from "./ThemeToggle";
import { RefreshButton } from "./RefreshButton";

interface HeaderProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onRefresh: () => void;
  loading: boolean;
  lastFetched: Date | null;
  totalBindings: number;
}

export function Header({ theme, onToggleTheme, onRefresh, loading, lastFetched, totalBindings }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-bg-primary/90 border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-800 tracking-tight text-text-primary">
            cheatsheet
            <span className="text-accent">.</span>
          </h1>
          <p className="font-mono text-[11px] text-text-muted mt-1 tracking-wide uppercase">
            {totalBindings} bindings — live from dotfiles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton onRefresh={onRefresh} loading={loading} lastFetched={lastFetched} />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}
