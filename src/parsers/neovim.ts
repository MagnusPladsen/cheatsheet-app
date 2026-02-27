import type { Binding } from "../types";
import { makeId } from "./index";

export function parseNeovim(files: Map<string, string>): Binding[] {
  const bindings: Binding[] = [];

  for (const [path, content] of files) {
    if (path.includes("astrocore") || path.includes("mappings") || path.includes("astrolsp")) {
      bindings.push(...parseLuaMappings(content, path));
    }
    if (path.includes("init.lua")) {
      bindings.push(...parseVimKeymapSet(content));
    }
  }

  return bindings;
}

function parseLuaMappings(content: string, source: string): Binding[] {
  const bindings: Binding[] = [];
  let currentMode = "normal";
  const lines = content.split("\n");

  for (const line of lines) {
    const modeMatch = line.match(/^\s*(n|i|v|x|t)\s*=\s*\{/);
    if (modeMatch) {
      const modeMap: Record<string, string> = {
        n: "normal", i: "insert", v: "visual", x: "visual", t: "terminal",
      };
      currentMode = modeMap[modeMatch[1]] || modeMatch[1];
    }

    const bindMatch = line.match(/\["([^"]+)"\]\s*=\s*\{.*?desc\s*=\s*"([^"]+)"/);
    if (bindMatch) {
      const [, key, desc] = bindMatch;
      bindings.push({
        id: makeId("neovim"),
        app: "neovim",
        key: formatNvimKey(key),
        action: desc,
        mode: currentMode,
        category: categorizeNvim(key, desc, source),
        isCustom: true,
        raw: line.trim(),
      });
    }

    const disabledMatch = line.match(/\["([^"]+)"\]\s*=\s*false/);
    if (disabledMatch) {
      bindings.push({
        id: makeId("neovim"),
        app: "neovim",
        key: formatNvimKey(disabledMatch[1]),
        action: "(disabled default)",
        mode: currentMode,
        category: "Disabled",
        isCustom: true,
        raw: line.trim(),
      });
    }
  }

  return bindings;
}

function parseVimKeymapSet(content: string): Binding[] {
  const bindings: Binding[] = [];
  const regex = /vim\.keymap\.set\(\s*"([^"]+)"\s*,\s*"([^"]+)"[^{]*\{\s*desc\s*=\s*"([^"]+)"/g;
  let match;
  while ((match = regex.exec(content))) {
    const modeMap: Record<string, string> = { n: "normal", i: "insert", v: "visual" };
    bindings.push({
      id: makeId("neovim"),
      app: "neovim",
      key: formatNvimKey(match[2]),
      action: match[3],
      mode: modeMap[match[1]] || match[1],
      category: "General",
      isCustom: true,
      raw: match[0],
    });
  }
  return bindings;
}

function formatNvimKey(key: string): string {
  return key
    .replace(/<Leader>/gi, "Space")
    .replace(/<C-/gi, "Ctrl+")
    .replace(/<M-/gi, "Alt+")
    .replace(/<S-/gi, "Shift+")
    .replace(/>/g, "");
}

function categorizeNvim(key: string, desc: string, source: string): string {
  if (source.includes("astrolsp")) return "LSP";
  const d = desc.toLowerCase();
  if (d.includes("buffer")) return "Buffer";
  if (d.includes("window") || d.includes("pane")) return "Window";
  if (d.includes("search") || d.includes("find")) return "Search";
  if (d.includes("git") || d.includes("hunk")) return "Git";
  if (d.includes("diagnostic")) return "Diagnostics";
  if (d.includes("toggle")) return "Toggle";
  if (key.includes("Leader") || key.includes("leader")) return "Leader";
  return "General";
}
