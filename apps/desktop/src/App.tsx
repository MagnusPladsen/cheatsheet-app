import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import {
  useSearch,
  useTheme,
  Header,
  SearchBar,
  FilterBar,
  AppSection,
  LoadingState,
  lc,
  APP_LIST,
} from "@cheatsheet/shared";
import type { AppId } from "@cheatsheet/shared";
import { useBindings } from "./hooks/useBindings.ts";
import { FolderPicker } from "./components/FolderPicker.tsx";

export default function App() {
  const { bindings, loading, error, lastFetched, refresh, folders, addFolder, removeFolder } = useBindings();
  const {
    results, filters, setSearch, toggleApp, setBindingFilter,
    setCategory, resetFilters, categories, resultCount,
  } = useSearch(bindings);
  const { theme, themes, setTheme } = useTheme();

  const [showSettings, setShowSettings] = useState(false);

  const mainSearchRef = useRef<HTMLInputElement>(null);
  const compactSearchRef = useRef<HTMLInputElement>(null);
  const searchSentinelRef = useRef<HTMLDivElement>(null);
  const [searchOutOfView, setSearchOutOfView] = useState(false);

  useEffect(() => {
    const el = searchSentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSearchOutOfView(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stableSetSearch = useCallback((v: string) => setSearch(v), [setSearch]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        const tag = document.activeElement?.tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          e.preventDefault();
          if (searchOutOfView) {
            compactSearchRef.current?.focus();
          } else {
            mainSearchRef.current?.focus();
          }
        }
      }
      if (e.key === "Escape") {
        if (showSettings) {
          setShowSettings(false);
        } else {
          mainSearchRef.current?.blur();
          compactSearchRef.current?.blur();
          stableSetSearch("");
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchOutOfView, stableSetSearch, showSettings]);

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
        themes={themes}
        onSetTheme={setTheme}
        onRefresh={refresh}
        loading={loading}
        lastFetched={lastFetched}
        totalBindings={bindings.length}
        compactSearch={{
          visible: searchOutOfView,
          value: filters.search,
          onChange: setSearch,
          resultCount,
          totalCount: bindings.length,
          inputRef: compactSearchRef,
        }}
      />

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Settings toggle */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowSettings((s) => !s)}
            className="text-xs text-text-muted hover:text-accent transition-colors tracking-wider"
          >
            {showSettings ? lc("hide settings") : lc("settings")}
          </button>
        </div>

        {showSettings && (
          <FolderPicker
            folders={folders}
            onAddFolder={addFolder}
            onRemoveFolder={removeFolder}
          />
        )}

        <div ref={searchSentinelRef}>
          <SearchBar
            value={filters.search}
            onChange={setSearch}
            resultCount={resultCount}
            totalCount={bindings.length}
            inputRef={mainSearchRef}
          />
        </div>

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
            <p className="text-sm text-text-secondary mb-2">{lc("[error] failed to read configs")}</p>
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
          {lc("// reading local configs")}
          {" "}&middot; {lc("press")} <kbd className="px-1 py-0.5 bg-kbd-bg border border-kbd-border text-xs text-accent">/</kbd> {lc("to search")}
        </p>
      </footer>
    </div>
  );
}
