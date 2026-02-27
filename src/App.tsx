import { useMemo } from "react";
import { useBindings } from "./hooks/useBindings";
import { useSearch } from "./hooks/useSearch";
import { useTheme } from "./hooks/useTheme";
import { Header } from "./components/Header";
import { SearchBar } from "./components/SearchBar";
import { FilterBar } from "./components/FilterBar";
import { AppSection } from "./components/AppSection";
import { LoadingState } from "./components/LoadingState";
import type { AppId } from "./types";
import { APP_LIST } from "./constants";

export default function App() {
  const { bindings, loading, error, lastFetched, refresh } = useBindings();
  const {
    results, filters, setSearch, toggleApp, setBindingFilter,
    setCategory, resetFilters, categories, resultCount,
  } = useSearch(bindings);
  const { theme, toggle: toggleTheme } = useTheme();

  const groupedByApp = useMemo(() => {
    const map = new Map<AppId, typeof results>();
    for (const app of APP_LIST) {
      const appBindings = results.filter((b) => b.app === app.id);
      if (appBindings.length > 0) map.set(app.id, appBindings);
    }
    return map;
  }, [results]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onRefresh={refresh}
        loading={loading}
        lastFetched={lastFetched}
        totalBindings={bindings.length}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <SearchBar
          value={filters.search}
          onChange={setSearch}
          resultCount={resultCount}
          totalCount={bindings.length}
        />

        <FilterBar
          activeApps={filters.apps}
          onToggleApp={toggleApp}
          bindingFilter={filters.bindingFilter}
          onSetBindingFilter={setBindingFilter}
          activeCategory={filters.category}
          categories={categories}
          onSetCategory={setCategory}
          onReset={resetFilters}
        />

        {loading && bindings.length === 0 ? (
          <LoadingState />
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 text-lg mb-2">Failed to load bindings</p>
            <p className="text-text-muted text-sm mb-4">{error}</p>
            <button onClick={refresh} className="px-4 py-2 bg-accent rounded-lg text-white hover:bg-accent-light transition-colors">
              Retry
            </button>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted text-lg">No bindings match your filters</p>
            <button onClick={resetFilters} className="mt-4 text-accent hover:text-accent-light transition-colors">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {[...groupedByApp.entries()].map(([appId, appBindings]) => (
              <AppSection key={appId} appId={appId} bindings={appBindings} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-text-muted">
        Fetched live from{" "}
        <a href="https://github.com/MagnusPladsen/dotfiles" className="text-accent hover:text-accent-light transition-colors" target="_blank" rel="noreferrer">
          MagnusPladsen/dotfiles
        </a>
        {" "} | Press <kbd className="px-1 py-0.5 bg-kbd-bg border border-kbd-border rounded text-[10px]">/</kbd> to search
      </footer>
    </div>
  );
}
