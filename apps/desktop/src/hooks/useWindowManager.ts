import { useCallback, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function useWindowManager() {
  const overlayMode = useRef(false);

  const toggleOverlay = useCallback(async () => {
    const win = getCurrentWindow();
    const visible = await win.isVisible();

    if (visible && overlayMode.current) {
      await win.setAlwaysOnTop(false);
      await win.setDecorations(true);
      await win.hide();
      overlayMode.current = false;
    } else if (visible && !overlayMode.current) {
      await win.setAlwaysOnTop(true);
      await win.setDecorations(false);
      overlayMode.current = true;
    } else {
      await win.setAlwaysOnTop(true);
      await win.setDecorations(false);
      await win.show();
      await win.setFocus();
      overlayMode.current = true;
    }
  }, []);

  const showNormal = useCallback(async () => {
    const win = getCurrentWindow();
    await win.setAlwaysOnTop(false);
    await win.setDecorations(true);
    await win.show();
    await win.setFocus();
    overlayMode.current = false;
  }, []);

  const hide = useCallback(async () => {
    const win = getCurrentWindow();
    await win.setAlwaysOnTop(false);
    await win.setDecorations(true);
    await win.hide();
    overlayMode.current = false;
  }, []);

  return { toggleOverlay, showNormal, hide };
}
