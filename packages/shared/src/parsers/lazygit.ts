import type { Binding } from "../types";
import { makeId } from "./index";
import yaml from "js-yaml";

interface LazygitConfig {
  keybinding?: Record<string, Record<string, string>>;
}

export function parseLazygit(files: Map<string, string>): Binding[] {
  const bindings: Binding[] = [];

  for (const [path, content] of files) {
    if (!path.includes("lazygit")) continue;

    try {
      const parsed = yaml.load(content) as LazygitConfig;
      if (!parsed?.keybinding) continue;

      for (const [context, contextBindings] of Object.entries(parsed.keybinding)) {
        if (typeof contextBindings !== "object" || contextBindings === null) continue;

        for (const [action, key] of Object.entries(contextBindings)) {
          if (typeof key !== "string") continue;

          bindings.push({
            id: makeId("lazygit"),
            app: "lazygit",
            key: formatLazygitKey(key),
            action: formatAction(action),
            mode: context,
            category: categorizeContext(context),
            isCustom: true,
            raw: `${context}.${action}: ${key}`,
          });
        }
      }
    } catch (err) {
      console.warn(`Failed to parse Lazygit config at ${path}:`, err);
    }
  }

  return bindings;
}

function formatLazygitKey(key: string): string {
  return key
    .replace(/<c-([^>]+)>/gi, (_, k) => `Ctrl+${k.toUpperCase()}`)
    .replace(/<a-([^>]+)>/gi, (_, k) => `Alt+${k.toUpperCase()}`)
    .replace(/<enter>/gi, "Enter")
    .replace(/<esc>/gi, "Esc")
    .replace(/<tab>/gi, "Tab")
    .replace(/<space>/gi, "Space");
}

function formatAction(action: string): string {
  return action
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function categorizeContext(context: string): string {
  const c = context.toLowerCase();
  if (c === "universal") return "Universal";
  if (c === "files") return "Files";
  if (c === "branches") return "Branches";
  if (c === "commits") return "Commits";
  if (c === "stash") return "Stash";
  if (c === "status") return "Status";
  if (c === "submodules") return "Submodules";
  return context;
}
