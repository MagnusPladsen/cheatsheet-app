import { useMemo } from "react";
import { useBindings } from "./hooks/useBindings";
import { useSearch } from "./hooks/useSearch";
import { useTheme } from "./hooks/useTheme";
import { Header } from "./components/Header";
import { SearchBar } from "./components/SearchBar";
import { FilterBar } from "./components/FilterBar";
import { AppSection } from "./components/AppSection";
import { LoadingState } from "./components/LoadingState";
import { lc } from "./utils/text";
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

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
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
            <p className="text-sm text-text-secondary mb-2">{lc("[error] failed to fetch")}</p>
            <p className="text-xs text-text-muted mb-4">{lc(error)}</p>
            <button onClick={refresh} className="px-3 py-1.5 border border-accent/30 text-accent text-xs tracking-wider hover:bg-accent-dim transition-colors">
              {lc("retry")}
            </button>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-sm text-text-muted tracking-wider">{lc("no matches found")}</p>
            <button onClick={resetFilters} className="mt-3 text-xs text-accent hover:text-accent-light transition-colors tracking-wider">
              {lc("clear filters")}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {entries.map(([appId, appBindings], i) => (
              <AppSection key={appId} appId={appId} bindings={appBindings} index={i} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-text-muted tracking-wider">
          {lc("// live from")}{" "}
          <a href="https://github.com/MagnusPladsen/dotfiles" className="text-accent/40 hover:text-accent transition-colors" target="_blank" rel="noreferrer">
            {lc("dotfiles")}
          </a>
          {" "}· {lc("press")} <kbd className="px-1 py-0.5 bg-kbd-bg border border-kbd-border text-xs text-accent">/</kbd> {lc("to search")}
        </p>
      </footer>
    </div>
  );
}
