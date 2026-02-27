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

  const entries = [...groupedByApp.entries()];

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

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
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
          <div className="text-center py-24">
            <p className="font-mono text-sm text-red-400 mb-2">ERROR</p>
            <p className="text-text-muted text-sm mb-6">{error}</p>
            <button onClick={refresh} className="px-4 py-2 border border-accent text-accent font-mono text-xs tracking-wider hover:bg-accent-dim transition-colors">
              RETRY
            </button>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-mono text-sm text-text-muted tracking-wider">NO MATCHES</p>
            <button onClick={resetFilters} className="mt-4 font-mono text-xs text-accent hover:text-accent-light transition-colors tracking-wider">
              CLEAR FILTERS
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {entries.map(([appId, appBindings], i) => (
              <AppSection key={appId} appId={appId} bindings={appBindings} index={i} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-8 text-center">
        <p className="font-mono text-[10px] text-text-muted tracking-widest uppercase">
          live from{" "}
          <a href="https://github.com/MagnusPladsen/dotfiles" className="text-accent/70 hover:text-accent transition-colors" target="_blank" rel="noreferrer">
            dotfiles
          </a>
          {" "}&middot; press <kbd className="px-1 py-0.5 bg-kbd-bg border border-kbd-border text-[9px] font-mono">/</kbd> to search
        </p>
      </footer>
    </div>
  );
}
