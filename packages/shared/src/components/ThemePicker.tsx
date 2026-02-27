import { useState, useRef, useEffect } from "react";
import type { Theme } from "../themes";
import { lc } from "../utils/text";

interface ThemePickerProps {
  currentTheme: Theme;
  themes: Theme[];
  onSelect: (id: string) => void;
}

export function ThemePicker({ currentTheme, themes, onSelect }: ThemePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 h-7 border border-border text-text-muted hover:text-accent hover:border-accent/20 transition-colors text-[10px] tracking-wider"
      >
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: currentTheme.accent }}
        />
        {lc(currentTheme.name)}
        <span className="text-text-muted/50">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 min-w-[180px] border border-border bg-bg-primary py-1 z-50 shadow-lg max-h-[400px] overflow-y-auto">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onSelect(t.id);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-left transition-colors ${
                t.id === currentTheme.id
                  ? "text-accent bg-accent-dim"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-secondary"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: t.accent }}
              />
              {lc(t.name)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
