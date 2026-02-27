import type { AppId } from "../types";
import { APP_LIST } from "../constants";
import { lc } from "../utils/text";

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
  { value: "all", label: "all" },
  { value: "custom", label: "custom" },
  { value: "default", label: "default" },
];

export function FilterBar({
  activeApps, onToggleApp, bindingFilter, onSetBindingFilter,
  activeCategory, categories, onSetCategory, onReset,
}: FilterBarProps) {
  const hasFilters = activeApps.length > 0 || bindingFilter !== "all" || activeCategory;

  return (
    <div className="space-y-3">
      {/* app filters */}
      <div className="flex flex-wrap gap-1 justify-center">
        {APP_LIST.map((app) => {
          const active = activeApps.includes(app.id);
          return (
            <button
              key={app.id}
              onClick={() => onToggleApp(app.id)}
              className={`px-2.5 py-1 text-xs tracking-wider border transition-colors ${
                active
                  ? "border-accent/40 text-accent bg-accent-dim"
                  : "border-border text-text-muted hover:text-text-secondary hover:border-border-hover"
              }`}
            >
              {lc(app.name)}
            </button>
          );
        })}
      </div>

      {/* binding type + category */}
      <div className="flex flex-wrap gap-1.5 justify-center items-center">
        <div className="inline-flex border border-border">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSetBindingFilter(opt.value)}
              className={`px-2.5 py-1 text-xs tracking-wider transition-colors ${
                bindingFilter === opt.value
                  ? "bg-accent-dim text-accent"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {lc(opt.label)}
            </button>
          ))}
        </div>

        {categories.length > 0 && (
          <select
            value={activeCategory || ""}
            onChange={(e) => onSetCategory(e.target.value || null)}
            className="px-2.5 py-1 text-xs bg-bg-card border border-border text-text-muted focus:border-accent/30 focus:outline-none tracking-wider"
          >
            <option value="">{lc("all categories")}</option>
            {categories.map((c) => (
              <option key={c} value={c}>{lc(c)}</option>
            ))}
          </select>
        )}

        {hasFilters && (
          <button
            onClick={onReset}
            className="px-2.5 py-1 text-xs text-text-muted hover:text-accent transition-colors tracking-wider"
          >
            {lc("clear")}
          </button>
        )}
      </div>
    </div>
  );
}
