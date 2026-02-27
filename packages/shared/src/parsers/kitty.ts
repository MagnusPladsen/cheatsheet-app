import type { Binding } from "../types";
import { makeId } from "./index";

export function parseKitty(files: Map<string, string>): Binding[] {
  const bindings: Binding[] = [];
  const content = files.get(".config/kitty/kitty.conf");
  if (!content) return bindings;

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (line.startsWith("#") || !line) continue;

    const match = line.match(/^map\s+(\S+)\s+(.+)/);
    if (match) {
      const [, key, action] = match;
      bindings.push({
        id: makeId("kitty"),
        app: "kitty",
        key: formatKittyKey(key),
        action: action.replace(/_/g, " "),
        category: categorizeKitty(action),
        isCustom: true,
        raw: line,
      });
    }
  }

  return bindings;
}

function formatKittyKey(key: string): string {
  return key.replace(/\bctrl\b/gi, "Ctrl").replace(/\bshift\b/gi, "Shift")
    .replace(/\balt\b/gi, "Alt").replace(/\bsuper\b/gi, "Cmd")
    .replace(/\+/g, " + ");
}

function categorizeKitty(action: string): string {
  if (action.includes("tab")) return "Tab";
  if (action.includes("window")) return "Window";
  if (action.includes("scroll")) return "Scroll";
  if (action.includes("font")) return "Font";
  return "General";
}
