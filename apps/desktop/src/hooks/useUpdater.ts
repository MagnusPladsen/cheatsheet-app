import { useState, useEffect, useCallback, useRef } from "react";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

interface UpdateState {
  available: boolean;
  version: string | null;
  body: string | null;
  installing: boolean;
  checking: boolean;
  error: string | null;
}

export function useUpdater() {
  const [state, setState] = useState<UpdateState>({
    available: false,
    version: null,
    body: null,
    installing: false,
    checking: false,
    error: null,
  });
  const [dismissed, setDismissed] = useState(false);
  const updateRef = useRef<Update | null>(null);

  const checkForUpdates = useCallback(async () => {
    setState((s) => ({ ...s, checking: true, error: null }));
    try {
      const update = await check();
      if (update) {
        updateRef.current = update;
        setState((s) => ({
          ...s,
          available: true,
          version: update.version,
          body: update.body ?? null,
          checking: false,
        }));
        setDismissed(false);
      } else {
        setState((s) => ({ ...s, checking: false }));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("Update check failed:", msg);
      setState((s) => ({ ...s, checking: false, error: msg }));
    }
  }, []);

  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  const install = useCallback(async () => {
    setState((s) => ({ ...s, installing: true, error: null }));
    try {
      const update = updateRef.current ?? await check();
      if (update) {
        await update.downloadAndInstall();
        await relaunch();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setState((s) => ({ ...s, installing: false, error: msg }));
    }
  }, []);

  const dismiss = useCallback(() => setDismissed(true), []);

  return { ...state, dismissed, install, dismiss, checkForUpdates };
}
