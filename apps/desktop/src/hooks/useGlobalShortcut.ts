import { useEffect } from "react";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";

export function useGlobalShortcut(shortcut: string, handler: () => void) {
  useEffect(() => {
    let registered = false;

    register(shortcut, (event) => {
      if (event.state === "Pressed") {
        handler();
      }
    })
      .then(() => {
        registered = true;
      })
      .catch((err) => {
        console.warn(`Failed to register shortcut ${shortcut}:`, err);
      });

    return () => {
      if (registered) {
        unregister(shortcut).catch(() => {});
      }
    };
  }, [shortcut, handler]);
}
