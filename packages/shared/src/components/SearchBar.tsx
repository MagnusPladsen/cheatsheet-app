import { lc } from "../utils/text";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  resultCount: number;
  totalCount: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function SearchBar({ value, onChange, resultCount, totalCount, inputRef }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted group-focus-within:text-accent transition-colors">
          &gt;
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={lc("fuzzy search bindings...")}
          className="w-full pl-8 pr-24 py-2.5 bg-bg-card border border-border text-text-primary text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-accent/30 transition-colors"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {value && (
            <button
              onClick={() => onChange("")}
              className="text-xs text-text-muted hover:text-accent transition-colors"
            >
              {lc("esc")}
            </button>
          )}
          <span className="text-xs text-text-muted tabular-nums">
            {resultCount}/{totalCount}
          </span>
        </div>
      </div>
    </div>
  );
}
