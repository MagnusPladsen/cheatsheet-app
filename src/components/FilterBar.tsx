import type { AppId } from "../types";
import { APP_LIST } from "../constants";

type BindingFilter = "all" | "custom" | "default";

interface FilterBarProps {
  activeApps: AppId[];
  onToggleApp: (app: AppId) => void;
  bindingFilter: BindingFilter;
  onSetBindingFilter: (v: BindingFilter) => void;
  activeCategory: string | null;
  categories: string[];
  onSetCategory: (c: string | null) => void;
  onReset: () => void;
}

const filterOptions: { value: BindingFilter; label: string }[] = [
  { value: "all", label: "ALL" },
  { value: "custom", label: "CUSTOM" },
  { value: "default", label: "DEFAULT" },
];

export function FilterBar({
  activeApps, onToggleApp, bindingFilter, onSetBindingFilter,
  activeCategory, categories, onSetCategory, onReset,
}: FilterBarProps) {
  const hasFilters = activeApps.length > 0 || bindingFilter !== "all" || activeCategory;

  return (
    <div className="space-y-4">
      {/* App filters */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {APP_LIST.map((app) => {
          const active = activeApps.includes(app.id);
          return (
            <button
              key={app.id}
              onClick={() => onToggleApp(app.id)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors ${
                active
                  ? "bg-accent-dim border-accent/40 text-accent"
                  : "bg-transparent border-border text-text-muted hover:border-border-hover hover:text-text-secondary"
              }`}
            >
              <span className="mr-1.5">{app.icon}</span>
              {app.name}
            </button>
          );
        })}
      </div>

      {/* Binding type toggle + category */}
      <div className="flex flex-wrap gap-2 justify-center items-center">
        <div className="inline-flex border border-border overflow-hidden">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSetBindingFilter(opt.value)}
              className={`px-3 py-1.5 text-[11px] font-mono tracking-widest transition-colors ${
                bindingFilter === opt.value
                  ? "bg-accent-dim text-accent"
                  : "bg-transparent text-text-muted hover:text-text-secondary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {categories.length > 0 && (
          <select
            value={activeCategory || ""}
            onChange={(e) => onSetCategory(e.target.value || null)}
            className="px-3 py-1.5 text-xs font-mono bg-bg-card border border-border text-text-muted focus:border-accent/40 focus:outline-none uppercase tracking-wider"
          >
            <option value="">ALL CATEGORIES</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c.toUpperCase()}</option>
            ))}
          </select>
        )}

        {hasFilters && (
          <button
            onClick={onReset}
            className="px-3 py-1.5 text-[11px] font-mono text-text-muted hover:text-accent transition-colors tracking-wider"
          >
            CLEAR
          </button>
        )}
      </div>
    </div>
  );
}
