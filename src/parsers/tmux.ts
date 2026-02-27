import type { Binding } from "../types";
import { makeId } from "./index";

export function parseTmux(files: Map<string, string>): Binding[] {
  const bindings: Binding[] = [];
  const content = files.get(".tmux.conf");
  if (!content) return bindings;

  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("#") || !line) continue;

    const bindMatch = line.match(/^bind(?:-key)?\s+(?:-\w+\s+)*(\S+)\s+(.+)/);
    if (bindMatch) {
      const [, key, action] = bindMatch;
      const comment = i > 0 && lines[i - 1].trim().startsWith("#")
        ? lines[i - 1].trim().slice(1).trim()
        : "";
      const displayMatch = line.match(/display\s+"([^"]+)"/);

      bindings.push({
        id: makeId("tmux"),
        app: "tmux",
        key: `prefix + ${key}`,
        action: displayMatch?.[1] || comment || action,
        category: categorizeTmux(action),
        isCustom: true,
        raw: line,
      });
    }
  }

  return bindings;
}

function categorizeTmux(action: string): string {
  if (action.includes("source")) return "Config";
  if (action.includes("display-popup") || action.includes("popup")) return "Popup";
  if (action.includes("split")) return "Pane";
  if (action.includes("select-window")) return "Window";
  return "General";
}
