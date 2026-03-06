import type { Binding } from "../types";
import { makeId } from "./index";

export function parseI3(files: Map<string, string>): Binding[] {
  const bindings: Binding[] = [];

  for (const [path, content] of files) {
    if (!path.includes("i3") && !path.includes("sway")) continue;

    // Detect $mod variable
    let mod = "Mod4";
    const modMatch = content.match(/set\s+\$mod\s+(\S+)/);
    if (modMatch) mod = modMatch[1];

    for (const rawLine of content.split("\n")) {
      const line = rawLine.trim();
      if (line.startsWith("#") || !line) continue;

      // bindsym $mod+key command
      const bindMatch = line.match(/^bindsym\s+(\S+)\s+(.+)/);
      if (bindMatch) {
        const [, key, command] = bindMatch;
        bindings.push({
          id: makeId("i3"),
          app: "i3",
          key: formatI3Key(key, mod),
          action: formatCommand(command),
          category: categorize(command),
          isCustom: true,
          raw: line,
        });
        continue;
      }

      // bindcode $mod+code command
      const codeMatch = line.match(/^bindcode\s+(\S+)\s+(.+)/);
      if (codeMatch) {
        const [, key, command] = codeMatch;
        bindings.push({
          id: makeId("i3"),
          app: "i3",
          key: formatI3Key(key, mod),
          action: formatCommand(command),
          category: categorize(command),
          isCustom: true,
          raw: line,
        });
      }
    }
  }

  return bindings;
}

function formatI3Key(key: string, mod: string): string {
  return key
    .replace(/\$mod/g, modToLabel(mod))
    .replace(/Mod1/g, "Alt")
    .replace(/Mod4/g, "Super")
    .replace(/\+/g, " + ")
    .replace(/\bReturn\b/gi, "Enter")
    .replace(/\bspace\b/gi, "Space");
}

function modToLabel(mod: string): string {
  if (mod === "Mod4") return "Super";
  if (mod === "Mod1") return "Alt";
  return mod;
}

function formatCommand(command: string): string {
  // Remove exec --no-startup-id prefix
  return command
    .replace(/^exec\s+--no-startup-id\s+/, "exec ")
    .replace(/^exec\s+/, "Run: ")
    .trim();
}

function categorize(command: string): string {
  const c = command.toLowerCase();
  if (c.includes("focus")) return "Focus";
  if (c.includes("move")) return "Move";
  if (c.includes("workspace")) return "Workspace";
  if (c.includes("resize")) return "Resize";
  if (c.includes("layout")) return "Layout";
  if (c.includes("split")) return "Split";
  if (c.includes("float")) return "Floating";
  if (c.includes("fullscreen")) return "Fullscreen";
  if (c.includes("kill") || c.includes("close")) return "Close";
  if (c.includes("exec")) return "Launch";
  if (c.includes("mode")) return "Mode";
  if (c.includes("reload") || c.includes("restart")) return "Config";
  return "General";
}
