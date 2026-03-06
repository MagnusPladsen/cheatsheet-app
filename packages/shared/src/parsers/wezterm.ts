import type { Binding } from "../types";
import { makeId } from "./index";

export function parseWezterm(files: Map<string, string>): Binding[] {
  const bindings: Binding[] = [];

  for (const [path, content] of files) {
    if (!path.includes("wezterm")) continue;
    bindings.push(...parseWeztermKeys(content));
  }

  return bindings;
}

function parseWeztermKeys(content: string): Binding[] {
  const bindings: Binding[] = [];

  // Match key assignment blocks: { key = "x", mods = "CTRL", action = wezterm.action.Something }
  // or { key = "x", mods = "CTRL", action = act.Something }
  const keyPattern = /\{\s*key\s*=\s*"([^"]+)"\s*,\s*mods\s*=\s*"([^"]+)"\s*,\s*action\s*=\s*([^}]+)\}/g;
  let match;

  while ((match = keyPattern.exec(content))) {
    const [raw, key, mods, actionRaw] = match;
    const action = cleanAction(actionRaw.trim());

    bindings.push({
      id: makeId("wezterm"),
      app: "wezterm",
      key: formatWeztermKey(mods, key),
      action,
      category: categorize(action),
      isCustom: true,
      raw: raw.trim(),
    });
  }

  // Alternative format: keys table with string-indexed entries
  // { mods = "CTRL|SHIFT", key = "x", action = ... }
  const altPattern = /\{\s*mods\s*=\s*"([^"]+)"\s*,\s*key\s*=\s*"([^"]+)"\s*,\s*action\s*=\s*([^}]+)\}/g;
  while ((match = altPattern.exec(content))) {
    const [raw, mods, key, actionRaw] = match;
    const action = cleanAction(actionRaw.trim());

    bindings.push({
      id: makeId("wezterm"),
      app: "wezterm",
      key: formatWeztermKey(mods, key),
      action,
      category: categorize(action),
      isCustom: true,
      raw: raw.trim(),
    });
  }

  return bindings;
}

function cleanAction(action: string): string {
  // wezterm.action.SendString("\x01") → Send String
  // act.SplitHorizontal → Split Horizontal
  return action
    .replace(/^(?:wezterm\.action\.|act\.)/, "")
    .replace(/\(.*?\)/, "")
    .replace(/,?\s*$/, "")
    .replace(/([A-Z])/g, " $1")
    .trim();
}

function formatWeztermKey(mods: string, key: string): string {
  const modParts = mods
    .split("|")
    .map((m) => {
      const lower = m.trim().toLowerCase();
      if (lower === "super" || lower === "cmd") return "Cmd";
      if (lower === "ctrl") return "Ctrl";
      if (lower === "alt" || lower === "opt") return "Alt";
      if (lower === "shift") return "Shift";
      return m.trim();
    });

  return [...modParts, key.toUpperCase()].join(" + ");
}

function categorize(action: string): string {
  const a = action.toLowerCase();
  if (a.includes("split") || a.includes("pane")) return "Pane";
  if (a.includes("tab")) return "Tab";
  if (a.includes("window")) return "Window";
  if (a.includes("font") || a.includes("size")) return "Font";
  if (a.includes("copy") || a.includes("paste") || a.includes("clipboard")) return "Clipboard";
  if (a.includes("scroll")) return "Scroll";
  if (a.includes("search")) return "Search";
  return "General";
}
