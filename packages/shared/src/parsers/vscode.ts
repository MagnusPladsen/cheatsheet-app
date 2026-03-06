import type { AppId, Binding } from "../types";
import { makeId } from "./index";

interface VSCodeKeybinding {
  key: string;
  command: string;
  when?: string;
  args?: unknown;
}

/**
 * Shared parser for VS Code-style keybindings.json files.
 * Used by VS Code, Cursor, and any other VS Code forks.
 */
export function parseVSCodeStyle(
  files: Map<string, string>,
  appId: AppId,
  filePaths: string[],
): Binding[] {
  const bindings: Binding[] = [];

  for (const path of filePaths) {
    const content = files.get(path);
    if (!content) continue;

    try {
      // Strip comments (JSON with comments / JSONC)
      const cleaned = content
        .replace(/\/\/.*$/gm, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/,\s*([\]}])/g, "$1");
      const entries = JSON.parse(cleaned) as VSCodeKeybinding[];

      for (const entry of entries) {
        if (!entry.key || !entry.command) continue;

        // Skip removals (commands starting with -)
        const isRemoval = entry.command.startsWith("-");
        const command = isRemoval ? entry.command.slice(1) : entry.command;

        bindings.push({
          id: makeId(appId),
          app: appId,
          key: formatVSCodeKey(entry.key),
          action: isRemoval ? `(unbind) ${formatCommand(command)}` : formatCommand(command),
          mode: entry.when ? extractMode(entry.when) : undefined,
          category: categorize(command),
          isCustom: true,
          raw: `${entry.key}: ${entry.command}`,
        });
      }
    } catch (err) {
      console.warn(`Failed to parse ${appId} keybindings at ${path}:`, err);
    }
  }

  return bindings;
}

export function parseVSCode(files: Map<string, string>): Binding[] {
  return parseVSCodeStyle(files, "vscode", [
    "Library/Application Support/Code/User/keybindings.json",
    ".config/Code/User/keybindings.json",
  ]);
}

export function parseCursor(files: Map<string, string>): Binding[] {
  return parseVSCodeStyle(files, "cursor", [
    "Library/Application Support/Cursor/User/keybindings.json",
    ".config/Cursor/User/keybindings.json",
  ]);
}

function formatVSCodeKey(key: string): string {
  return key
    .replace(/\bcmd\b/gi, "Cmd")
    .replace(/\bctrl\b/gi, "Ctrl")
    .replace(/\balt\b/gi, "Alt")
    .replace(/\bshift\b/gi, "Shift")
    .replace(/\benter\b/gi, "Enter")
    .replace(/\bescape\b/gi, "Esc")
    .replace(/\bspace\b/gi, "Space")
    .replace(/\btab\b/gi, "Tab")
    .replace(/\bbackspace\b/gi, "Backspace")
    .replace(/\+/g, " + ");
}

function formatCommand(command: string): string {
  // workbench.action.toggleSidebar → Toggle Sidebar (Workbench)
  const parts = command.split(".");
  if (parts.length >= 3) {
    const action = parts.slice(-1)[0]
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
    return `${action} (${parts[0]})`;
  }
  return command.replace(/([A-Z])/g, " $1").trim();
}

function extractMode(when: string): string | undefined {
  if (when.includes("vim.mode") || when.includes("neovim")) return "vim";
  if (when.includes("terminalFocus")) return "terminal";
  if (when.includes("editorTextFocus")) return "editor";
  return undefined;
}

function categorize(command: string): string {
  const c = command.toLowerCase();
  if (c.includes("terminal")) return "Terminal";
  if (c.includes("sidebar") || c.includes("panel") || c.includes("view")) return "View";
  if (c.includes("editor") || c.includes("tab") || c.includes("group")) return "Editor";
  if (c.includes("search") || c.includes("find") || c.includes("quickopen")) return "Search";
  if (c.includes("git") || c.includes("scm")) return "Git";
  if (c.includes("debug")) return "Debug";
  if (c.includes("extension")) return "Extensions";
  if (c.includes("file") || c.includes("save") || c.includes("folder")) return "File";
  if (c.includes("format") || c.includes("refactor") || c.includes("rename")) return "Refactor";
  return "General";
}
