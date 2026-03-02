import { useEffect, useRef } from "react";
import { watch } from "@tauri-apps/plugin-fs";
import { APP_LIST } from "@cheatsheet/shared";

export function useFileWatcher(folders: string[], onRefresh: () => void) {
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (folders.length === 0) return;

    const unwatchFns: (() => void)[] = [];

    // Collect unique directories to watch
    const dirsToWatch = new Set<string>();
    for (const folder of folders) {
      for (const app of APP_LIST) {
        for (const filePath of app.filePaths) {
          const dir = filePath.split("/").slice(0, -1).join("/");
          if (dir) {
            dirsToWatch.add(`${folder}/${dir}`);
          } else {
            dirsToWatch.add(folder);
          }
        }
      }
    }

    for (const dir of dirsToWatch) {
      watch(dir, () => {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(onRefresh, 500);
      }, { recursive: false })
        .then((unwatch) => unwatchFns.push(unwatch))
        .catch(() => {
          // Directory may not exist, that's fine
        });
    }

    return () => {
      clearTimeout(debounceTimer.current);
      for (const unwatch of unwatchFns) {
        unwatch();
      }
    };
  }, [folders, onRefresh]);
}
