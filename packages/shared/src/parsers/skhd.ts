import type { Binding } from "../types";
import { makeId } from "./index";

export function parseSkhd(files: Map<string, string>): Binding[] {
  const bindings: Binding[] = [];

  for (const [path, content] of files) {
    if (!path.includes("skhd") && !path.endsWith(".skhdrc")) continue;

    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("#") || !line) continue;

      // Format: mod - key : command
      // or: mod + mod - key : command
      const match = line.match(/^([^:]+?)\s*:\s*(.+)$/);
      if (!match) continue;

      const [, keyPart, command] = match;
      const trimmedKey = keyPart.trim();

      // Skip mode declarations like :: default
      if (trimmedKey.startsWith("::")) continue;

      // Check for preceding comment as description
      const prevLine = i > 0 ? lines[i - 1].trim() : "";
      const comment = prevLine.startsWith("#") ? prevLine.slice(1).trim() : "";

      bindings.push({
        id: makeId("skhd"),
        app: "skhd",
        key: formatSkhdKey(trimmedKey),
        action: comment || command.trim(),
        category: categorize(command),
        isCustom: true,
        raw: line,
      });
    }
  }

  return bindings;
}

function formatSkhdKey(key: string): string {
  return key
    .replace(/\bcmd\b/gi, "Cmd")
    .replace(/\bctrl\b/gi, "Ctrl")
    .replace(/\balt\b/gi, "Alt")
    .replace(/\bshift\b/gi, "Shift")
    .replace(/\bfn\b/gi, "Fn")
    .replace(/\s*-\s*/g, " + ")
    .replace(/\s*\+\s*/g, " + ");
}

function categorize(command: string): string {
  const c = command.toLowerCase();
  if (c.includes("yabai") && c.includes("focus")) return "Focus";
  if (c.includes("yabai") && c.includes("swap")) return "Swap";
  if (c.includes("yabai") && c.includes("move")) return "Move";
  if (c.includes("yabai") && c.includes("resize")) return "Resize";
  if (c.includes("yabai") && c.includes("space")) return "Space";
  if (c.includes("yabai") && c.includes("display")) return "Display";
  if (c.includes("yabai") && c.includes("layout")) return "Layout";
  if (c.includes("yabai")) return "Yabai";
  if (c.includes("open") || c.includes("launch")) return "Launch";
  return "General";
}
