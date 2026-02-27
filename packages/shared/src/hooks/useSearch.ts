import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import type { AppId, Binding } from "../types";

export type BindingFilter = "all" | "custom" | "default";

interface Filters {
  search: string;
  apps: AppId[];
  bindingFilter: BindingFilter;
  category: string | null;
}

interface UseSearchReturn {
  results: Binding[];
  filters: Filters;
  setSearch: (q: string) => void;
  toggleApp: (app: AppId) => void;
  setBindingFilter: (v: BindingFilter) => void;
  setCategory: (c: string | null) => void;
  resetFilters: () => void;
  categories: string[];
  resultCount: number;
}

const defaultFilters: Filters = {
  search: "",
  apps: [],
  bindingFilter: "all",
  category: null,
};

export function useSearch(bindings: Binding[]): UseSearchReturn {
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const fuse = useMemo(
    () =>
      new Fuse(bindings, {
        keys: [
          { name: "key", weight: 2 },
          { name: "action", weight: 1.5 },
          { name: "category", weight: 0.5 },
          { name: "app", weight: 0.5 },
          { name: "mode", weight: 0.3 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [bindings]
  );

  const results = useMemo(() => {
    let filtered = bindings;

    if (filters.search.trim()) {
      filtered = fuse.search(filters.search).map((r) => r.item);
    }

    if (filters.apps.length > 0) {
      filtered = filtered.filter((b) => filters.apps.includes(b.app));
    }

    if (filters.bindingFilter === "custom") {
      filtered = filtered.filter((b) => b.isCustom);
    } else if (filters.bindingFilter === "default") {
      filtered = filtered.filter((b) => !b.isCustom);
    }

    if (filters.category) {
      filtered = filtered.filter((b) => b.category === filters.category);
    }

    return filtered;
  }, [bindings, filters, fuse]);

  const categories = useMemo(() => {
    const cats = new Set(bindings.map((b) => b.category).filter(Boolean));
    return Array.from(cats).sort() as string[];
  }, [bindings]);

  return {
    results,
    filters,
    setSearch: (search) => setFilters((f) => ({ ...f, search })),
    toggleApp: (app) =>
      setFilters((f) => ({
        ...f,
        apps: f.apps.includes(app)
          ? f.apps.filter((a) => a !== app)
          : [...f.apps, app],
      })),
    setBindingFilter: (bindingFilter) => setFilters((f) => ({ ...f, bindingFilter })),
    setCategory: (category) => setFilters((f) => ({ ...f, category })),
    resetFilters: () => setFilters(defaultFilters),
    categories,
    resultCount: results.length,
  };
}
