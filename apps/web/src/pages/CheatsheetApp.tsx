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
  ShareButton,
  LoadingState,
  lc,
  APP_LIST,
  getShareHash,
  decodeBindings,
} from "@cheatsheet/shared";
import type { AppId, SearchResult, Binding } from "@cheatsheet/shared";
import { useBindings } from "../hooks/useBindings.ts";
import { useGitHubRepo } from "../hooks/useGitHubRepo.ts";
import { clearCache } from "../services/cache.ts";

function RepoConfigModal({
  currentOwner,
  currentRepo,
  isDefault,
  onSave,
  onReset,
  onClose,
}: {
  currentOwner: string;
  currentRepo: string;
  isDefault: boolean;
  onSave: (input: string) => boolean;
  onReset: () => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState(
    isDefault ? "" : `${currentOwner}/${currentRepo}`
  );
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (!input.trim()) {
      setError("enter a github repo url or owner/repo");
      return;
    }
    const ok = onSave(input);
    if (!ok) {
      setError("invalid format. use owner/repo or a github url");
      return;
    }
    clearCache();
    onClose();
  };

  const handleReset = () => {
    onReset();
    clearCache();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal
    >
      <div className="w-full max-w-md mx-4 border border-border bg-bg-primary p-6 space-y-4">
        <div>
          <h3 className="text-sm text-text-primary font-medium tracking-wider mb-1">
            {lc("// configure dotfiles repo")}
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            {lc("enter your github dotfiles repo to see your own keybindings.")}
          </p>
        </div>

        <div className="space-y-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onClose(); }}
            placeholder="owner/repo or https://github.com/owner/repo"
            className="w-full px-3 py-2 bg-bg-secondary border border-border text-xs text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
          />
          {error && (
            <p className="text-[10px] text-red-400 tracking-wider">{lc(error)}</p>
          )}
          <p className="text-[10px] text-text-muted">
            {lc("the repo must be public. config files are read from the repo root.")}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            {!isDefault && (
              <button
                onClick={handleReset}
                className="text-[10px] text-text-muted hover:text-accent transition-colors tracking-wider cursor-pointer"
              >
                {lc("reset to default")}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors tracking-wider cursor-pointer"
            >
              {lc("cancel")}
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 border border-accent/50 text-accent text-xs tracking-wider hover:bg-accent/10 transition-colors cursor-pointer"
            >
              {lc("save & reload")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheatsheetApp() {
  const { repo: ghRepo, setRepo, resetRepo, isDefault } = useGitHubRepo();
  const { bindings: fetchedBindings, loading, error, lastFetched, refresh } = useBindings(ghRepo);
  const [showRepoConfig, setShowRepoConfig] = useState(false);

  const [sharedBindings] = useState<Binding[] | null>(() => {
    const hash = getShareHash();
    return hash ? decodeBindings(hash) : null;
  });
  const isSharedView = sharedBindings !== null;
  const bindings = isSharedView ? sharedBindings : fetchedBindings;
  const {
    results, filters, setSearch, toggleApp, setBindingFilter,
    setCategory, resetFilters, categories, resultCount,
  } = useSearch(bindings);
  const { theme, themes, setTheme } = useTheme();
  const { conflicts, conflictCount, showConflicts, toggleConflicts } = useConflicts(bindings);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showPractice, setShowPractice] = useState(false);

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
        mainSearchRef.current?.blur();
        compactSearchRef.current?.blur();
        stableSetSearch("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchOutOfView, stableSetSearch]);

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

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Repo indicator bar */}
        <div className="border border-border bg-bg-secondary/30 px-4 py-2.5 flex items-center justify-between">
          <p className="text-[10px] text-text-muted tracking-wider">
            {lc("// source:")}{" "}
            <a
              href={`https://github.com/${ghRepo.owner}/${ghRepo.repo}`}
              target="_blank"
              rel="noreferrer"
              className="text-accent/60 hover:text-accent transition-colors"
            >
              {ghRepo.owner}/{ghRepo.repo}
            </a>
            {isDefault && (
              <span className="text-text-muted/40 ml-1.5">(default)</span>
            )}
          </p>
          <button
            onClick={() => setShowRepoConfig(true)}
            className="text-[10px] text-text-muted hover:text-accent transition-colors tracking-wider cursor-pointer"
          >
            {lc("change repo")}
          </button>
        </div>

        {isSharedView && (
          <div className="border border-accent/30 bg-accent-dim px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-accent tracking-wider">
              {lc("// viewing shared bindings")} [{bindings.length}]
            </p>
            <a
              href={window.location.pathname}
              className="text-xs text-text-muted hover:text-accent transition-colors tracking-wider"
            >
              {lc("view your own")} →
            </a>
          </div>
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
          <ExportButton contentRef={contentRef} />
          {!isSharedView && (
            <ShareButton
              bindings={bindings}
              filteredBindings={results.map((r) => r.binding)}
              activeCategory={filters.category}
            />
          )}
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

      {showRepoConfig && (
        <RepoConfigModal
          currentOwner={ghRepo.owner}
          currentRepo={ghRepo.repo}
          isDefault={isDefault}
          onSave={setRepo}
          onReset={resetRepo}
          onClose={() => setShowRepoConfig(false)}
        />
      )}

      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-text-muted tracking-wider">
          {lc("// live from")}{" "}
          <a
            href={`https://github.com/${ghRepo.owner}/${ghRepo.repo}`}
            className="text-accent/40 hover:text-accent transition-colors"
            target="_blank"
            rel="noreferrer"
          >
            {lc(`${ghRepo.owner}/${ghRepo.repo}`)}
          </a>
          {" "}&middot; {lc("press")} <kbd className="px-1 py-0.5 bg-kbd-bg border border-kbd-border text-xs text-accent">/</kbd> {lc("to search")}
        </p>
      </footer>
    </div>
  );
}
