import type { Binding } from "../types";
import { makeId } from "./index";
import { parse as parseTOML } from "smol-toml";

export function parseAerospace(files: Map<string, string>): Binding[] {
  const bindings: Binding[] = [];
  const content = files.get(".config/aerospace/config.toml");
  if (!content) return bindings;

  try {
    const parsed = parseTOML(content);
    const mode = parsed.mode as Record<string, { binding?: Record<string, unknown> }> | undefined;
    if (!mode) return bindings;

    for (const [modeName, modeConfig] of Object.entries(mode)) {
      const modeBindings = modeConfig.binding;
      if (!modeBindings) continue;

      for (const [key, action] of Object.entries(modeBindings)) {
        const actionStr = Array.isArray(action) ? action.join(" then ") : String(action);
        bindings.push({
          id: makeId("aerospace"),
          app: "aerospace",
          key: formatAeroKey(key),
          action: actionStr,
          mode: modeName,
          category: categorizeAero(actionStr),
          isCustom: true,
          raw: `${key} = '${actionStr}'`,
        });
      }
    }
  } catch (err) {
    console.warn("Failed to parse AeroSpace config:", err);
  }

  return bindings;
}

function formatAeroKey(key: string): string {
  return key.replace(/\balt\b/g, "Opt").replace(/\bcmd\b/g, "Cmd")
    .replace(/\bctrl\b/g, "Ctrl").replace(/\bshift\b/g, "Shift")
    .replace(/-/g, " + ");
}

function categorizeAero(action: string): string {
  if (action.includes("focus")) return "Focus";
  if (action.includes("move")) return "Move";
  if (action.includes("workspace")) return "Workspace";
  if (action.includes("resize")) return "Resize";
  if (action.includes("layout")) return "Layout";
  if (action.includes("mode")) return "Mode";
  if (action.includes("exec")) return "Execute";
  return "General";
}
