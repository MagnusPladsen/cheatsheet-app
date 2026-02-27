import type { AppId } from "../types";
import { APP_LIST } from "../constants";

interface FilterBarProps {
  activeApps: AppId[];
  onToggleApp: (app: AppId) => void;
  customOnly: boolean;
  onToggleCustom: (v: boolean) => void;
  activeCategory: string | null;
  categories: string[];
  onSetCategory: (c: string | null) => void;
  onReset: () => void;
}

export function FilterBar({
  activeApps, onToggleApp, customOnly, onToggleCustom,
  activeCategory, categories, onSetCategory, onReset,
}: FilterBarProps) {
  const hasFilters = activeApps.length > 0 || customOnly || activeCategory;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 justify-center">
        {APP_LIST.map((app) => {
          const active = activeApps.includes(app.id);
          return (
            <button
              key={app.id}
              onClick={() => onToggleApp(app.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
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
        <button
          onClick={() => onToggleCustom(!customOnly)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
            customOnly
              ? "bg-purple-500/20 border-purple-500 text-purple-300"
              : "bg-bg-card border-border text-text-secondary hover:border-purple-500/50"
          }`}
        >
          Custom Only
        </button>

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
