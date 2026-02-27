import { useRef, useEffect } from "react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  resultCount: number;
  totalCount: number;
}

export function SearchBar({ value, onChange, resultCount, totalCount }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        const active = document.activeElement?.tagName;
        if (active !== "INPUT" && active !== "TEXTAREA") {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
        onChange("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onChange]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-text-muted group-focus-within:text-accent transition-colors">
          /
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="search bindings..."
          className="w-full pl-10 pr-24 py-3 bg-bg-card border border-border text-text-primary font-body text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:bg-bg-secondary transition-colors"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {value && (
            <button
              onClick={() => onChange("")}
              className="font-mono text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              ESC
            </button>
          )}
          <span className="font-mono text-[11px] text-text-muted tabular-nums">
            {resultCount}/{totalCount}
          </span>
        </div>
      </div>
    </div>
  );
}
