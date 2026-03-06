import type { Binding } from "../types";
import { makeId } from "./index";

export function parseVim(files: Map<string, string>): Binding[] {
  const bindings: Binding[] = [];
  const content = files.get(".vimrc");
  if (!content) return bindings;

  const MAP_REGEX = /^(n|i|v|x|c|t)?(?:nore)?map(?:\s+<(?:buffer|expr|silent|nowait|unique|special|script)>)*\s+(\S+)\s+(.+)/;
  const MODE_MAP: Record<string, string> = {
    n: "normal", i: "insert", v: "visual", x: "visual",
    c: "command", t: "terminal", "": "normal",
  };

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (line.startsWith('"') || !line) continue;

    const commentIdx = line.lastIndexOf('" ');
    const comment = commentIdx > 0 ? line.slice(commentIdx + 2).trim() : "";

    const match = line.match(MAP_REGEX);
    if (!match) continue;

    const [, modeChar = "n", key, actionRaw] = match;
    const action = comment || actionRaw.split('"')[0].trim();

    bindings.push({
      id: makeId("vim"),
      app: "vim",
      key: formatVimKey(key),
      action,
      mode: MODE_MAP[modeChar] || modeChar,
      category: categorize(key, action),
      isCustom: true,
      raw: line,
    });
  }

  // Also parse let mapleader
  const leaderMatch = content.match(/let\s+mapleader\s*=\s*["'](.+?)["']/);
  if (leaderMatch) {
    bindings.push({
      id: makeId("vim"),
      app: "vim",
      key: leaderMatch[1],
      action: "Leader key",
      category: "Leader",
      isCustom: true,
      raw: leaderMatch[0],
    });
  }

  return bindings;
}

function formatVimKey(key: string): string {
  return key
    .replace(/<Leader>/gi, "Space")
    .replace(/<C-([^>]+)>/gi, (_, k) => `Ctrl+${k.toUpperCase()}`)
    .replace(/<M-([^>]+)>/gi, (_, k) => `Alt+${k.toUpperCase()}`)
    .replace(/<A-([^>]+)>/gi, (_, k) => `Alt+${k.toUpperCase()}`)
    .replace(/<S-([^>]+)>/gi, (_, k) => `Shift+${k.toUpperCase()}`)
    .replace(/<CR>/gi, "Enter")
    .replace(/<Esc>/gi, "Esc")
    .replace(/<Tab>/gi, "Tab")
    .replace(/<BS>/gi, "Backspace")
    .replace(/<Space>/gi, "Space")
    .replace(/<nop>/gi, "(disabled)");
}

function categorize(key: string, desc: string): string {
  const d = desc.toLowerCase();
  const k = key.toLowerCase();
  if (d.includes("buffer")) return "Buffer";
  if (d.includes("window") || k.includes("c-w")) return "Window";
  if (d.includes("search") || d.includes("find")) return "Search";
  if (d.includes("git")) return "Git";
  if (d.includes("toggle")) return "Toggle";
  if (d.includes("save") || d.includes(":w")) return "File";
  if (d.includes("paste") || d.includes("yank") || d.includes("clipboard")) return "Clipboard";
  if (d.includes("move") || d.includes("join")) return "Editing";
  if (k.includes("space") || k.includes("leader")) return "Leader";
  return "General";
}
