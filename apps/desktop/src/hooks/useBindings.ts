import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { Binding } from "@cheatsheet/shared";
import { APP_LIST, parsers, resetIdCounter, getDefaultBindings } from "@cheatsheet/shared";

interface UseBindingsReturn {
  bindings: Binding[];
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
  refresh: () => void;
  folders: string[];
  addFolder: (path: string) => Promise<void>;
  removeFolder: (path: string) => Promise<void>;
}

export function useBindings(): UseBindingsReturn {
  const [bindings, setBindings] = useState<Binding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [folders, setFolders] = useState<string[]>([]);

  const loadFolders = useCallback(async () => {
    try {
      const stored = await invoke<string[]>("get_stored_folders");
      if (stored.length === 0) {
        const home = await invoke<string>("get_home_dir");
        setFolders([home]);
        await invoke("save_folders", { folders: [home] });
      } else {
        setFolders(stored);
      }
    } catch (err) {
      console.warn("Failed to load folders:", err);
      setFolders([]);
    }
  }, []);

  const fetchBindings = useCallback(async (currentFolders: string[]) => {
    setLoading(true);
    setError(null);

    try {
      resetIdCounter();
      const customBindings: Binding[] = [];

      for (const folder of currentFolders) {
        for (const app of APP_LIST) {
          const fileMap = await invoke<Record<string, string>>("read_config_files", {
            basePath: folder,
            filePatterns: app.filePaths,
          });

          const map = new Map(Object.entries(fileMap));
          if (map.size > 0) {
            const parsed = parsers[app.id](map);
            customBindings.push(...parsed);
          }
        }
      }

      const defaults = getDefaultBindings();
      setBindings([...customBindings, ...defaults]);
      setLastFetched(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read config files");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  useEffect(() => {
    if (folders.length > 0) {
      fetchBindings(folders);
    } else {
      setLoading(false);
    }
  }, [folders, fetchBindings]);

  const refresh = useCallback(() => {
    fetchBindings(folders);
  }, [fetchBindings, folders]);

  const addFolder = useCallback(async (path: string) => {
    const updated = [...folders, path];
    setFolders(updated);
    await invoke("save_folders", { folders: updated });
  }, [folders]);

  const removeFolder = useCallback(async (path: string) => {
    const updated = folders.filter((f) => f !== path);
    setFolders(updated);
    await invoke("save_folders", { folders: updated });
  }, [folders]);

  return { bindings, loading, error, lastFetched, refresh, folders, addFolder, removeFolder };
}
