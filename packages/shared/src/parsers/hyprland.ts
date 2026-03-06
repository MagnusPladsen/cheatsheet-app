import type { Binding } from "../types";
import { makeId } from "./index";

export function parseHyprland(files: Map<string, string>): Binding[] {
  const bindings: Binding[] = [];
  const content = files.get(".config/hypr/hyprland.conf");
  if (!content) return bindings;

  // Detect $mainMod variable
  let mainMod = "SUPER";
  const modMatch = content.match(/\$mainMod\s*=\s*(\S+)/);
  if (modMatch) mainMod = modMatch[1];

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (line.startsWith("#") || !line) continue;

    // bind = MOD, key, dispatcher, args
    // bindm = MOD, mouse:272, movewindow
    const match = line.match(/^bind([melr]*)\s*=\s*(.+)$/);
    if (!match) continue;

    const [, flags, rest] = match;
    const parts = rest.split(",").map((s) => s.trim());
    if (parts.length < 3) continue;

    const [mods, key, dispatcher, ...args] = parts;

    bindings.push({
      id: makeId("hyprland"),
      app: "hyprland",
      key: formatHyprlandKey(mods, key, mainMod),
      action: formatAction(dispatcher, args),
      category: categorize(dispatcher),
      isCustom: true,
      raw: line,
    });

    // Track bind flags for context
    if (flags.includes("l")) {
      // locked — works even when locked
    }
  }

  return bindings;
}

function formatHyprlandKey(mods: string, key: string, mainMod: string): string {
  let result = mods
    .replace(/\$mainMod/g, mainMod)
    .replace(/\bSUPER\b/gi, "Super")
    .replace(/\bCONTROL\b/gi, "Ctrl")
    .replace(/\bCTRL\b/gi, "Ctrl")
    .replace(/\bALT\b/gi, "Alt")
    .replace(/\bSHIFT\b/gi, "Shift");

  if (result && key) {
    result += " + " + key;
  } else {
    result = key;
  }

  return result
    .replace(/\bReturn\b/gi, "Enter")
    .replace(/\bspace\b/gi, "Space");
}

function formatAction(dispatcher: string, args: string[]): string {
  const arg = args.join(" ").trim();
  if (!arg) return dispatcher;
  return `${dispatcher}: ${arg}`;
}

function categorize(dispatcher: string): string {
  const d = dispatcher.toLowerCase();
  if (d.includes("movefocus") || d === "focuswindow") return "Focus";
  if (d.includes("movewindow") || d.includes("moveactive")) return "Move";
  if (d.includes("workspace")) return "Workspace";
  if (d.includes("resize")) return "Resize";
  if (d.includes("fullscreen")) return "Fullscreen";
  if (d.includes("float") || d === "togglefloating") return "Floating";
  if (d.includes("kill") || d === "killactive") return "Close";
  if (d === "exec") return "Launch";
  if (d.includes("split") || d === "togglesplit") return "Layout";
  if (d.includes("group")) return "Group";
  if (d.includes("pin")) return "Pin";
  return "General";
}
