import { useState, useEffect, useCallback } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

interface UpdateState {
  available: boolean;
  version: string | null;
  body: string | null;
  installing: boolean;
  error: string | null;
}

export function useUpdater() {
  const [state, setState] = useState<UpdateState>({
    available: false,
    version: null,
    body: null,
    installing: false,
    error: null,
  });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    check()
      .then((update) => {
        if (update) {
          setState((s) => ({
            ...s,
            available: true,
            version: update.version,
            body: update.body ?? null,
          }));
        }
      })
      .catch((err) => {
        console.warn("Update check failed:", err);
      });
  }, []);

  const install = useCallback(async () => {
    setState((s) => ({ ...s, installing: true, error: null }));
    try {
      const update = await check();
      if (update) {
        await update.downloadAndInstall();
        await relaunch();
      }
    } catch (err) {
      setState((s) => ({
        ...s,
        installing: false,
        error: err instanceof Error ? err.message : "Update failed",
      }));
    }
  }, []);

  const dismiss = useCallback(() => setDismissed(true), []);

  return {
    ...state,
    dismissed,
    install,
    dismiss,
  };
}
