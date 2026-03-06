import { useState, useEffect, useCallback, useRef } from "react";
import type { AppId, Binding } from "@cheatsheet/shared";
import { APP_LIST, parsers, resetIdCounter, getDefaultBindings } from "@cheatsheet/shared";
import { fetchAllFiles } from "../services/github.ts";
import { clearCache } from "../services/cache.ts";
import type { GitHubRepo } from "./useGitHubRepo.ts";

interface UseBindingsReturn {
  bindings: Binding[];
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
  refresh: () => void;
}

export function useBindings(repos: GitHubRepo[]): UseBindingsReturn {
  const [bindings, setBindings] = useState<Binding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Stable serialized key for deps
  const reposKey = repos.map((r) => `${r.owner}/${r.repo}`).join(",");

  const fetchBindings = useCallback(async (force = false) => {
    if (repos.length === 0) return;

    setLoading(true);
    setError(null);

    if (force) clearCache();

    try {
      resetIdCounter();
      const customBindings: Binding[] = [];

      for (const ghRepo of repos) {
        for (const app of APP_LIST) {
          const files = await fetchAllFiles(ghRepo.owner, ghRepo.repo, app.filePaths);
          const parsed = parsers[app.id](files);
          customBindings.push(...parsed);
        }
      }

      const activeApps = new Set<AppId>(customBindings.map((b) => b.app));
      const defaults = getDefaultBindings(activeApps);
      setBindings([...customBindings, ...defaults]);
      setLastFetched(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bindings");
    } finally {
      setLoading(false);
    }
  }, [reposKey]);

  useEffect(() => {
    if (repos.length === 0) {
      setBindings([]);
      setLoading(false);
      return;
    }
    fetchBindings();
    intervalRef.current = setInterval(() => fetchBindings(), 5 * 60 * 1000);
    return () => clearInterval(intervalRef.current);
  }, [fetchBindings, reposKey]);

  const refresh = useCallback(() => fetchBindings(true), [fetchBindings]);

  return { bindings, loading, error, lastFetched, refresh };
}
