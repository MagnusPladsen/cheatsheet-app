import type { Binding } from "../types";
import { makeId } from "./index";

export function parseNeovim(files: Map<string, string>): Binding[] {
  const bindings: Binding[] = [];

  for (const [path, content] of files) {
    if (path.includes("astrocore") || path.includes("mappings.lua") || path.includes("astrolsp")) {
      bindings.push(...parseLuaMappings(content, path));
    }
    if (path.endsWith(".lua")) {
      bindings.push(...parseVimKeymapSet(content));
    }
    // .vimrc is handled by the dedicated vim parser
  }

  return bindings;
}

// Parse AstroNvim lua table mappings (handles multi-line)
function parseLuaMappings(content: string, source: string): Binding[] {
  const bindings: Binding[] = [];
  let currentMode = "normal";
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detect mode sections: n = {, i = {, v = {
    const modeMatch = trimmed.match(/^\s*(n|i|v|x|t)\s*=\s*\{/);
    if (modeMatch) {
      const modeMap: Record<string, string> = {
        n: "normal", i: "insert", v: "visual", x: "visual", t: "terminal",
      };
      currentMode = modeMap[modeMatch[1]] || modeMatch[1];
    }

    // Single-line: ["<Key>"] = { ..., desc = "..." }
    const singleLine = trimmed.match(/\["([^"]+)"\]\s*=\s*\{.*?desc\s*=\s*"([^"]+)"/);
    if (singleLine) {
      bindings.push({
        id: makeId("neovim"),
        app: "neovim",
        key: formatKey(singleLine[1]),
        action: singleLine[2],
        mode: currentMode,
        category: categorize(singleLine[1], singleLine[2], source),
        isCustom: true,
        raw: trimmed,
      });
      continue;
    }

    // Multi-line bracket key: ["<Key>"] = { or ["<Key>"] = {\n
    const multiStart = trimmed.match(/^\["([^"]+)"\]\s*=\s*\{/);
    if (multiStart && !trimmed.includes("desc")) {
      // Look ahead for desc in subsequent lines
      const desc = findDescInBlock(lines, i);
      if (desc) {
        bindings.push({
          id: makeId("neovim"),
          app: "neovim",
          key: formatKey(multiStart[1]),
          action: desc,
          mode: currentMode,
          category: categorize(multiStart[1], desc, source),
          isCustom: true,
          raw: trimmed,
        });
      }
      continue;
    }

    // Bare key (no brackets): gD = {
    const bareKey = trimmed.match(/^(\w+)\s*=\s*\{/);
    if (bareKey && !["n", "i", "v", "x", "t", "mappings", "opts"].includes(bareKey[1])) {
      const desc = findDescInBlock(lines, i) || trimmed.match(/desc\s*=\s*"([^"]+)"/)?.[1];
      if (desc) {
        bindings.push({
          id: makeId("neovim"),
          app: "neovim",
          key: formatKey(bareKey[1]),
          action: desc,
          mode: currentMode,
          category: categorize(bareKey[1], desc, source),
          isCustom: true,
          raw: trimmed,
        });
      }
      continue;
    }

    // Disabled: ["<Key>"] = false
    const disabledMatch = trimmed.match(/\["([^"]+)"\]\s*=\s*false/);
    if (disabledMatch) {
      bindings.push({
        id: makeId("neovim"),
        app: "neovim",
        key: formatKey(disabledMatch[1]),
        action: "(disabled default)",
        mode: currentMode,
        category: "Disabled",
        isCustom: true,
        raw: trimmed,
      });
    }
  }

  return bindings;
}

// Look ahead in lines to find desc = "..." within a multi-line block
function findDescInBlock(lines: string[], startIdx: number): string | null {
  let depth = 0;
  for (let j = startIdx; j < Math.min(startIdx + 15, lines.length); j++) {
    const l = lines[j];
    depth += (l.match(/\{/g) || []).length - (l.match(/\}/g) || []).length;

    const descMatch = l.match(/desc\s*=\s*"([^"]+)"/);
    if (descMatch) return descMatch[1];

    if (depth <= 0 && j > startIdx) break;
  }
  return null;
}

// Parse vim.keymap.set() calls and local aliases (e.g. local map = vim.keymap.set)
function parseVimKeymapSet(content: string): Binding[] {
  const bindings: Binding[] = [];

  // Detect aliases: local map = vim.keymap.set
  const funcNames = ["vim\\.keymap\\.set"];
  const aliasRegex = /local\s+(\w+)\s*=\s*vim\.keymap\.set/g;
  let aliasMatch;
  while ((aliasMatch = aliasRegex.exec(content))) {
    funcNames.push(aliasMatch[1]);
  }

  const caller = `(?:${funcNames.join("|")})`;
  const modeMap: Record<string, string> = { n: "normal", i: "insert", v: "visual", x: "visual", t: "terminal" };

  // Pattern 1: single mode string — map("n", "<key>", ..., { desc = "..." })
  const singleMode = new RegExp(
    `${caller}\\(\\s*"([^"]+)"\\s*,\\s*"([^"]+)"[\\s\\S]*?\\{\\s*desc\\s*=\\s*"([^"]+)"`,
    "g",
  );
  let match;
  while ((match = singleMode.exec(content))) {
    bindings.push({
      id: makeId("neovim"),
      app: "neovim",
      key: formatKey(match[2]),
      action: match[3],
      mode: modeMap[match[1]] || match[1],
      category: categorize(match[2], match[3], "init.lua"),
      isCustom: true,
      raw: match[0],
    });
  }

  // Pattern 2: multi mode table — map({ "n", "v" }, "<key>", ..., { desc = "..." })
  const multiMode = new RegExp(
    `${caller}\\(\\s*\\{([^}]+)\\}\\s*,\\s*"([^"]+)"[\\s\\S]*?\\{\\s*desc\\s*=\\s*"([^"]+)"`,
    "g",
  );
  while ((match = multiMode.exec(content))) {
    const modes = match[1].split(",").map((m) => m.trim().replace(/"/g, ""));
    for (const mode of modes) {
      if (!mode) continue;
      bindings.push({
        id: makeId("neovim"),
        app: "neovim",
        key: formatKey(match[2]),
        action: match[3],
        mode: modeMap[mode] || mode,
        category: categorize(match[2], match[3], "init.lua"),
        isCustom: true,
        raw: match[0],
      });
    }
  }

  return bindings;
}

// Format vim key notation into readable form
function formatKey(key: string): string {
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
    .replace(/<nop>/gi, "(disabled)")
    .replace(/<plug>\(([^)]+)\)/gi, "plug:$1");
}

function categorize(key: string, desc: string, source: string): string {
  if (source.includes("astrolsp")) return "LSP";
  const d = desc.toLowerCase();
  const k = key.toLowerCase();
  if (d.includes("buffer")) return "Buffer";
  if (d.includes("window") || d.includes("pane") || k.includes("c-w") || k.includes("C-W")) return "Window";
  if (d.includes("search") || d.includes("find") || d.includes("fzf")) return "Search";
  if (d.includes("git") || d.includes("hunk") || d.includes("lazygit")) return "Git";
  if (d.includes("diagnostic")) return "Diagnostics";
  if (d.includes("toggle")) return "Toggle";
  if (d.includes("save") || d.includes(":w")) return "File";
  if (d.includes("paste") || d.includes("yank") || d.includes("clipboard")) return "Clipboard";
  if (d.includes("move") || d.includes("join")) return "Editing";
  if (d.includes("lsp") || d.includes("declaration") || d.includes("definition")) return "LSP";
  if (k.includes("space") || k.includes("leader")) return "Leader";
  return "General";
}
