import type { Binding } from "../types";
import { makeId } from "./index";

export function parseZed(files: Map<string, string>): Binding[] {
  const bindings: Binding[] = [];
  const content = files.get(".config/zed/keymap.json");
  if (!content) return bindings;

  try {
    const entries = JSON.parse(content) as Array<{
      context?: string;
      bindings: Record<string, string | [string, unknown]>;
    }>;

    for (const entry of entries) {
      const mode = extractZedMode(entry.context || "");
      for (const [key, action] of Object.entries(entry.bindings)) {
        const actionStr = Array.isArray(action) ? action[0] : action;
        bindings.push({
          id: makeId("zed"),
          app: "zed",
          key: formatZedKey(key),
          action: formatZedAction(actionStr),
          mode: mode || undefined,
          category: categorizeZed(actionStr),
          isCustom: true,
          raw: `${key}: ${actionStr}`,
        });
      }
    }
  } catch (err) {
    console.warn("Failed to parse Zed keymap:", err);
  }

  return bindings;
}

function extractZedMode(context: string): string {
  const match = context.match(/vim_mode\s*==\s*(\w+)/);
  if (match) return match[1];
  if (context.includes("Terminal")) return "terminal";
  return "global";
}

function formatZedKey(key: string): string {
  return key.replace(/\bctrl\b/gi, "Ctrl").replace(/\balt\b/gi, "Alt")
    .replace(/\bshift\b/gi, "Shift").replace(/\bcmd\b/gi, "Cmd")
    .replace(/\bspace\b/gi, "Space").replace(/-/g, "+");
}

function formatZedAction(action: string): string {
  const parts = action.split("::");
  if (parts.length === 2) return `${parts[1]} (${parts[0]})`;
  return action;
}

function categorizeZed(action: string): string {
  const a = action.toLowerCase();
  if (a.includes("pane")) return "Pane";
  if (a.includes("workspace")) return "Workspace";
  if (a.includes("file_finder") || a.includes("search")) return "Search";
  if (a.includes("buffer") || a.includes("tab")) return "Buffer";
  if (a.includes("terminal")) return "Terminal";
  return "General";
}
