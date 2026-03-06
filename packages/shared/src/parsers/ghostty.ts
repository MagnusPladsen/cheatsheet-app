import type { Binding } from "../types";
import { makeId } from "./index";

export function parseGhostty(files: Map<string, string>): Binding[] {
  const bindings: Binding[] = [];
  const content = files.get(".config/ghostty/config");
  if (!content) return bindings;

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (line.startsWith("#") || !line) continue;

    // Format: keybind = mod+key=action or keybind = mod+key=action:arg
    const match = line.match(/^keybind\s*=\s*(.+)$/);
    if (!match) continue;

    const value = match[1].trim();
    const eqIdx = value.lastIndexOf("=");
    if (eqIdx === -1) continue;

    const keyPart = value.slice(0, eqIdx).trim();
    const actionPart = value.slice(eqIdx + 1).trim();

    if (!keyPart || !actionPart) continue;

    bindings.push({
      id: makeId("ghostty"),
      app: "ghostty",
      key: formatGhosttyKey(keyPart),
      action: formatAction(actionPart),
      category: categorize(actionPart),
      isCustom: true,
      raw: line,
    });
  }

  return bindings;
}

function formatGhosttyKey(key: string): string {
  return key
    .replace(/\bsuper\b/gi, "Cmd")
    .replace(/\bctrl\b/gi, "Ctrl")
    .replace(/\balt\b/gi, "Alt")
    .replace(/\bshift\b/gi, "Shift")
    .replace(/\+/g, " + ");
}

function formatAction(action: string): string {
  // new_split:right → New Split Right
  return action
    .replace(/:(.+)/, " ($1)")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function categorize(action: string): string {
  const a = action.toLowerCase();
  if (a.includes("split") || a.includes("pane")) return "Pane";
  if (a.includes("tab") || a.includes("window")) return "Window";
  if (a.includes("font") || a.includes("size")) return "Font";
  if (a.includes("copy") || a.includes("paste") || a.includes("clipboard")) return "Clipboard";
  if (a.includes("scroll")) return "Scroll";
  if (a.includes("config") || a.includes("reload")) return "Config";
  return "General";
}
