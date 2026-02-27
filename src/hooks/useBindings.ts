import { useState, useEffect, useCallback, useRef } from "react";
import type { Binding } from "../types";
import { APP_LIST } from "../constants";
import { fetchAllFiles } from "../services/github";
import { parsers, resetIdCounter } from "../parsers";
import { clearCache } from "../services/cache";
import { getDefaultBindings } from "../data/defaults";

interface UseBindingsReturn {
  bindings: Binding[];
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
  refresh: () => void;
}

export function useBindings(): UseBindingsReturn {
  const [bindings, setBindings] = useState<Binding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetchBindings = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);

    if (force) clearCache();

    try {
      resetIdCounter();
      const customBindings: Binding[] = [];

      for (const app of APP_LIST) {
        const files = await fetchAllFiles(app.files);
        const parsed = parsers[app.id](files);
        customBindings.push(...parsed);
      }

      // Merge custom (fetched) + defaults
      const defaults = getDefaultBindings();
      setBindings([...customBindings, ...defaults]);
      setLastFetched(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bindings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBindings();
    intervalRef.current = setInterval(() => fetchBindings(), 5 * 60 * 1000);
    return () => clearInterval(intervalRef.current);
  }, [fetchBindings]);

  const refresh = useCallback(() => fetchBindings(true), [fetchBindings]);

  return { bindings, loading, error, lastFetched, refresh };
}
