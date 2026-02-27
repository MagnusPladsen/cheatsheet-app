import { ThemeToggle } from "./ThemeToggle";
import { RefreshButton } from "./RefreshButton";
import { lc } from "../utils/text";

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
    <header className="sticky top-0 z-50 bg-bg-primary/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold text-text-primary">
            <span className="text-accent">~/</span>{lc("cheatsheet")}
          </h1>
          <span className="text-xs text-text-muted tracking-wider">
            // {totalBindings} {lc("bindings")} · {lc("live from dotfiles")}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <RefreshButton onRefresh={onRefresh} loading={loading} lastFetched={lastFetched} />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}
