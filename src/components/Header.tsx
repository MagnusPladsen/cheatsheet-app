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
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-bg-primary/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
            My Cheatsheet
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            {totalBindings} bindings across all tools
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={onRefresh} loading={loading} lastFetched={lastFetched} />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}
