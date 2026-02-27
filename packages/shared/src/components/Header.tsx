import { ThemePicker } from "./ThemePicker";
import { RefreshButton } from "./RefreshButton";
import { lc } from "../utils/text";
import type { Theme } from "../themes";

interface CompactSearchProps {
  value: string;
  onChange: (v: string) => void;
  resultCount: number;
  totalCount: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

interface HeaderProps {
  theme: Theme;
  themes: Theme[];
  onSetTheme: (id: string) => void;
  onRefresh: () => void;
  loading: boolean;
  lastFetched: Date | null;
  totalBindings: number;
  compactSearch?: CompactSearchProps & { visible: boolean };
}

export function Header({
  theme, themes, onSetTheme,
  onRefresh, loading, lastFetched, totalBindings,
  compactSearch,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-bg-primary/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold text-text-primary">
            <span className="text-accent">~/</span>{lc("cheatsheet")}
          </h1>
          <span className="text-xs text-text-muted tracking-wider hidden sm:inline">
            // {totalBindings} {lc("bindings")}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <RefreshButton onRefresh={onRefresh} loading={loading} lastFetched={lastFetched} />
          <ThemePicker currentTheme={theme} themes={themes} onSelect={onSetTheme} />
        </div>
      </div>

      {compactSearch?.visible && (
        <div className="border-t border-border">
          <div className="max-w-6xl mx-auto px-6 py-2 flex items-center gap-3">
            <span className="text-xs text-text-muted">&gt;</span>
            <input
              ref={compactSearch.inputRef}
              type="text"
              value={compactSearch.value}
              onChange={(e) => compactSearch.onChange(e.target.value)}
              placeholder={lc("grep bindings...")}
              className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted/50 focus:outline-none"
            />
            {compactSearch.value && (
              <button
                onClick={() => compactSearch.onChange("")}
                className="text-[10px] text-text-muted hover:text-accent transition-colors"
              >
                {lc("esc")}
              </button>
            )}
            <span className="text-[10px] text-text-muted tabular-nums">
              {compactSearch.resultCount}/{compactSearch.totalCount}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
