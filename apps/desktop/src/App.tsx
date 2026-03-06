import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import {
  useSearch,
  useTheme,
  useConflicts,
  Header,
  SearchBar,
  FilterBar,
  AppSection,
  ConflictPanel,
  ExportButton,
  PracticeMode,
  LoadingState,
  lc,
  APP_LIST,
} from "@cheatsheet/shared";
import type { AppId, SearchResult } from "@cheatsheet/shared";
import { useBindings } from "./hooks/useBindings.ts";
import { useWindowManager } from "./hooks/useWindowManager.ts";
import { useGlobalShortcut } from "./hooks/useGlobalShortcut.ts";
import { useTray } from "./hooks/useTray.ts";
import { useFileWatcher } from "./hooks/useFileWatcher.ts";
import { getVersion } from "@tauri-apps/api/app";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { FolderPicker } from "./components/FolderPicker.tsx";
import { useUpdater } from "./hooks/useUpdater.ts";

export default function App() {
  const { bindings, loading, error, lastFetched, refresh, folders, addFolder, removeFolder } = useBindings();
  const {
    results, filters, setSearch, toggleApp, setBindingFilter,
    setCategory, resetFilters, categories, resultCount,
  } = useSearch(bindings);
  const { theme, themes, setTheme } = useTheme();
  const { conflicts, conflictCount, showConflicts, toggleConflicts } = useConflicts(bindings);

  const { toggleOverlay, showNormal, hide } = useWindowManager();
  useGlobalShortcut("CommandOrControl+Shift+K", toggleOverlay);
  useTray({ onShow: showNormal, onHide: hide, onToggle: toggleOverlay });
  useFileWatcher(folders, refresh);

  const [appVersion, setAppVersion] = useState("");
  useEffect(() => { getVersion().then(setAppVersion); }, []);
  const updater = useUpdater();
  const [showSettings, setShowSettings] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSaveFile = useCallback(async (data: Uint8Array, defaultName: string) => {
    const path = await save({
      defaultPath: defaultName,
      filters: defaultName.endsWith(".png")
        ? [{ name: "PNG Image", extensions: ["png"] }]
        : [{ name: "PDF Document", extensions: ["pdf"] }],
    });
    if (path) {
      await writeFile(path, data);
    }
  }, []);

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
    const map = new Map<AppId, SearchResult[]>();
    for (const app of APP_LIST) {
      const appResults = results.filter((r) => r.binding.app === app.id);
      if (appResults.length > 0) map.set(app.id, appResults);
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

      {updater.available && !updater.dismissed && (
        <div className="bg-accent/10 border-b border-accent/30 px-6 py-3 flex items-center justify-between">
          <p className="text-xs text-accent tracking-wider">
            {lc(`update available: v${updater.version}`)}
          </p>
          <div className="flex gap-3">
            <button
              onClick={updater.dismiss}
              className="text-xs text-text-muted hover:text-text-primary transition-colors tracking-wider cursor-pointer"
            >
              {lc("later")}
            </button>
            <button
              onClick={updater.install}
              disabled={updater.installing}
              className="px-3 py-1 border border-accent/50 text-accent text-xs tracking-wider hover:bg-accent/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              {updater.installing ? lc("installing...") : lc("update & restart")}
            </button>
          </div>
        </div>
      )}

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

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => setShowPractice(true)}
            className="text-xs text-text-muted hover:text-accent transition-colors tracking-wider"
          >
            {lc("practice")}
          </button>
          <ExportButton contentRef={contentRef} onSaveFile={handleSaveFile} />
          {conflictCount > 0 && (
            <button
              onClick={toggleConflicts}
              className={`text-xs tracking-wider transition-colors ${
                showConflicts
                  ? "text-amber-400"
                  : "text-text-muted hover:text-amber-400"
              }`}
            >
              {showConflicts ? lc("hide conflicts") : lc("conflicts")}{" "}
              <span className="text-amber-400/60">[{conflictCount}]</span>
            </button>
          )}
        </div>

        {showConflicts && <ConflictPanel conflicts={conflicts} />}

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
          <div ref={contentRef} className="space-y-8">
            {entries.map(([appId, appResults], i) => (
              <AppSection key={appId} appId={appId} results={appResults} index={i} />
            ))}
          </div>
        )}
      </main>

      {showPractice && (
        <PracticeMode
          bindings={bindings}
          onClose={() => setShowPractice(false)}
        />
      )}

      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-text-muted tracking-wider">
          {appVersion && <>{lc(`v${appVersion}`)}{" "}&middot;{" "}</>}
          {lc("// reading local configs")}
          {" "}&middot; {lc("press")} <kbd className="px-1 py-0.5 bg-kbd-bg border border-kbd-border text-xs text-accent">/</kbd> {lc("to search")}
        </p>
      </footer>
    </div>
  );
}
