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
  { value: "all", label: "All" },
  { value: "custom", label: "Custom" },
  { value: "default", label: "Default" },
];

export function FilterBar({
  activeApps, onToggleApp, bindingFilter, onSetBindingFilter,
  activeCategory, categories, onSetCategory, onReset,
}: FilterBarProps) {
  const hasFilters = activeApps.length > 0 || bindingFilter !== "all" || activeCategory;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 justify-center">
        {APP_LIST.map((app) => {
          const active = activeApps.includes(app.id);
          return (
            <button
              key={app.id}
              onClick={() => onToggleApp(app.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                active
                  ? "bg-accent/20 border-accent text-accent-light"
                  : "bg-bg-card border-border text-text-secondary hover:border-accent/50"
              }`}
            >
              {app.icon} {app.name}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 justify-center items-center">
        {/* Custom / Default / All toggle */}
        <div className="inline-flex rounded-full border border-border overflow-hidden">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSetBindingFilter(opt.value)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                bindingFilter === opt.value
                  ? "bg-accent/20 text-accent-light"
                  : "bg-bg-card text-text-secondary hover:bg-bg-card-hover"
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
            className="px-3 py-1.5 rounded-full text-sm bg-bg-card border border-border text-text-secondary focus:border-accent focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}

        {hasFilters && (
          <button
            onClick={onReset}
            className="px-3 py-1.5 rounded-full text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
