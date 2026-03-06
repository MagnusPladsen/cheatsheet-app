import type { Binding } from "../types";
import { makeId } from "./index";
import { parse as parseTOML } from "smol-toml";

interface AlacrittyKeybinding {
  key: string;
  mods?: string;
  action?: string;
  command?: string | { program: string; args?: string[] };
  chars?: string;
}

interface AlacrittyConfig {
  keyboard?: {
    bindings?: AlacrittyKeybinding[];
  };
  // Legacy format
  key_bindings?: AlacrittyKeybinding[];
}

export function parseAlacritty(files: Map<string, string>): Binding[] {
  const bindings: Binding[] = [];

  for (const [path, content] of files) {
    if (!path.includes("alacritty")) continue;

    try {
      const parsed = parseTOML(content) as unknown as AlacrittyConfig;
      const keyBindings = parsed.keyboard?.bindings || parsed.key_bindings || [];

      for (const kb of keyBindings) {
        const action = kb.action
          || (typeof kb.command === "string" ? kb.command : kb.command?.program)
          || (kb.chars ? `Send: ${formatChars(kb.chars)}` : "unknown");

        bindings.push({
          id: makeId("alacritty"),
          app: "alacritty",
          key: formatAlacrittyKey(kb.mods, kb.key),
          action: formatAction(action),
          category: categorize(action),
          isCustom: true,
          raw: `${kb.mods ? kb.mods + "+" : ""}${kb.key}: ${action}`,
        });
      }
    } catch (err) {
      console.warn(`Failed to parse Alacritty config at ${path}:`, err);
    }
  }

  return bindings;
}

function formatChars(chars: string): string {
  return chars.replace(/\\x([0-9a-f]{2})/gi, (_, hex) => {
    const code = parseInt(hex, 16);
    if (code < 32) return `Ctrl+${String.fromCharCode(code + 64)}`;
    return String.fromCharCode(code);
  });
}

function formatAlacrittyKey(mods: string | undefined, key: string): string {
  const parts: string[] = [];
  if (mods) {
    for (const mod of mods.split("|")) {
      const m = mod.trim().toLowerCase();
      if (m === "command" || m === "super") parts.push("Cmd");
      else if (m === "control") parts.push("Ctrl");
      else if (m === "alt" || m === "option") parts.push("Alt");
      else if (m === "shift") parts.push("Shift");
    }
  }
  parts.push(key);
  return parts.join(" + ");
}

function formatAction(action: string): string {
  return action
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function categorize(action: string): string {
  const a = action.toLowerCase();
  if (a.includes("paste") || a.includes("copy") || a.includes("clipboard")) return "Clipboard";
  if (a.includes("font") || a.includes("size")) return "Font";
  if (a.includes("scroll")) return "Scroll";
  if (a.includes("search")) return "Search";
  if (a.includes("spawn") || a.includes("window")) return "Window";
  if (a.includes("tab")) return "Tab";
  if (a.includes("vi") || a.includes("selection")) return "Vi Mode";
  return "General";
}
