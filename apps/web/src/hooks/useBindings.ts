import { useState, useEffect, useCallback, useRef } from "react";
import type { Binding } from "@cheatsheet/shared";
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

export function useBindings(ghRepo: GitHubRepo | null): UseBindingsReturn {
  const [bindings, setBindings] = useState<Binding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetchBindings = useCallback(async (force = false) => {
    if (!ghRepo) return;

    setLoading(true);
    setError(null);

    if (force) clearCache();

    try {
      resetIdCounter();
      const customBindings: Binding[] = [];

      for (const app of APP_LIST) {
        const files = await fetchAllFiles(ghRepo.owner, ghRepo.repo, app.filePaths);
        const parsed = parsers[app.id](files);
        customBindings.push(...parsed);
      }

      const defaults = getDefaultBindings();
      setBindings([...customBindings, ...defaults]);
      setLastFetched(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bindings");
    } finally {
      setLoading(false);
    }
  }, [ghRepo?.owner, ghRepo?.repo]);

  useEffect(() => {
    if (!ghRepo) {
      setBindings([]);
      setLoading(false);
      return;
    }
    fetchBindings();
    intervalRef.current = setInterval(() => fetchBindings(), 5 * 60 * 1000);
    return () => clearInterval(intervalRef.current);
  }, [fetchBindings, ghRepo]);

  const refresh = useCallback(() => fetchBindings(true), [fetchBindings]);

  return { bindings, loading, error, lastFetched, refresh };
}
