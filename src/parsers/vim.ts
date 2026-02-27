import type { Binding } from "../types";
import { makeId } from "./index";

const MODE_MAP: Record<string, string> = {
  n: "normal", i: "insert", v: "visual", x: "visual",
  c: "command", t: "terminal", "": "all",
};

const MAP_REGEX = /^(n|i|v|x|c|t)?(?:nore)?map(?:\s+<buffer>)?\s+(\S+)\s+(.+)/;

export function parseVim(files: Map<string, string>): Binding[] {
  const bindings: Binding[] = [];
  const content = files.get(".vimrc");
  if (!content) return bindings;

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
      key: key.replace(/<leader>/gi, "Space"),
      action,
      mode: MODE_MAP[modeChar] || modeChar,
      category: categorizeVim(key, action),
      isCustom: true,
      raw: line,
    });
  }

  return bindings;
}

function categorizeVim(key: string, action: string): string {
  if (key.includes("C-") && (action.includes("window") || action.includes("W>"))) return "Window";
  if (key.includes("leader")) return "Leader";
  if (action.includes("move") || action.includes("Move")) return "Editing";
  if (action.includes("yank") || action.includes('"+y')) return "Clipboard";
  if (action.includes("save") || action.includes(":w")) return "File";
  if (action.includes("lsp") || action.includes("LSP")) return "LSP";
  return "General";
}
