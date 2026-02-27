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
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search bindings... (press / to focus)"
          className="w-full pl-12 pr-20 py-3 bg-bg-card border border-border rounded-full text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-glow transition-all"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-16 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          >
            ✕
          </button>
        )}
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-muted tabular-nums">
          {resultCount}/{totalCount}
        </span>
      </div>
    </div>
  );
}
