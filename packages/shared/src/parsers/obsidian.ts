import type { Binding } from "../types";
import { makeId } from "./index";

/**
 * Obsidian stores custom hotkeys in .obsidian/hotkeys.json
 * Format: { "command-id": [{ "modifiers": ["Mod", "Shift"], "key": "P" }] }
 * "Mod" = Cmd on macOS, Ctrl on Windows/Linux
 */
export function parseObsidian(files: Map<string, string>): Binding[] {
  const bindings: Binding[] = [];
  const content = files.get(".obsidian/hotkeys.json");
  if (!content) return bindings;

  try {
    const hotkeys = JSON.parse(content) as Record<
      string,
      Array<{ modifiers: string[]; key: string }>
    >;

    for (const [command, shortcuts] of Object.entries(hotkeys)) {
      if (!Array.isArray(shortcuts)) continue;

      for (const shortcut of shortcuts) {
        if (!shortcut.key) continue;

        bindings.push({
          id: makeId("obsidian"),
          app: "obsidian",
          key: formatObsidianKey(shortcut.modifiers || [], shortcut.key),
          action: formatCommand(command),
          category: categorize(command),
          isCustom: true,
          raw: `${command}: ${(shortcut.modifiers ?? []).length > 0 ? (shortcut.modifiers ?? []).join("+") + "+" : ""}${shortcut.key}`,
        });
      }
    }
  } catch (err) {
    console.warn("Failed to parse Obsidian hotkeys:", err);
  }

  return bindings;
}

function formatObsidianKey(modifiers: string[], key: string): string {
  const mods = modifiers.map((m) => {
    if (m === "Mod") return "Cmd"; // macOS; would be Ctrl on Linux/Win
    if (m === "Ctrl") return "Ctrl";
    if (m === "Alt") return "Alt";
    if (m === "Shift") return "Shift";
    return m;
  });

  return [...mods, key].join(" + ");
}

function formatCommand(command: string): string {
  // editor:toggle-bold → Toggle Bold (Editor)
  const parts = command.split(":");
  if (parts.length >= 2) {
    const action = parts.slice(1).join(":")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return `${action} (${parts[0]})`;
  }
  return command.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function categorize(command: string): string {
  const c = command.toLowerCase();
  if (c.startsWith("editor:")) return "Editor";
  if (c.startsWith("workspace:")) return "Workspace";
  if (c.startsWith("file-explorer:")) return "File Explorer";
  if (c.startsWith("graph:")) return "Graph";
  if (c.startsWith("command-palette:")) return "Command Palette";
  if (c.startsWith("app:")) return "App";
  if (c.includes("search") || c.includes("find")) return "Search";
  if (c.includes("template")) return "Templates";
  if (c.includes("daily") || c.includes("note")) return "Notes";
  return "General";
}
