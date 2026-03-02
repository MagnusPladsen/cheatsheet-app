import { useEffect } from "react";
import { TrayIcon, type TrayIconEvent } from "@tauri-apps/api/tray";
import { Menu, MenuItem } from "@tauri-apps/api/menu";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface UseTrayOptions {
  onShow: () => void;
  onHide: () => void;
  onToggle: () => void;
}

export function useTray({ onShow, onHide, onToggle }: UseTrayOptions) {
  useEffect(() => {
    let tray: TrayIcon | null = null;

    async function setup() {
      const showItem = await MenuItem.new({
        id: "show",
        text: "Show",
        action: () => onShow(),
      });
      const hideItem = await MenuItem.new({
        id: "hide",
        text: "Hide",
        action: () => onHide(),
      });
      const quitItem = await MenuItem.new({
        id: "quit",
        text: "Quit",
        action: () => getCurrentWindow().destroy(),
      });

      const menu = await Menu.new({ items: [showItem, hideItem, quitItem] });

      tray = await TrayIcon.new({
        id: "cheatsheet-tray",
        tooltip: "cheatsheet",
        menu,
        menuOnLeftClick: false,
        action: (event: TrayIconEvent) => {
          if (event.type === "Click") {
            onToggle();
          }
        },
      });
    }

    setup().catch((err) => console.warn("Failed to create tray:", err));

    return () => {
      tray?.close().catch(() => {});
    };
  }, [onShow, onHide, onToggle]);
}
