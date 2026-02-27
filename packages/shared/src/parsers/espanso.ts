import type { Binding } from "../types";
import { makeId } from "./index";
import yaml from "js-yaml";

interface EspansoMatch {
  trigger: string;
  replace?: string;
  form?: string;
  vars?: Array<{ name: string; type: string }>;
}

interface EspansoFile {
  matches?: EspansoMatch[];
}

export function parseEspanso(files: Map<string, string>): Binding[] {
  const bindings: Binding[] = [];

  for (const [path, content] of files) {
    if (!path.includes("espanso")) continue;

    try {
      const parsed = yaml.load(content) as EspansoFile;
      if (!parsed?.matches) continue;

      for (const match of parsed.matches) {
        const action = match.replace
          ? match.replace.length > 80
            ? match.replace.slice(0, 80) + "..."
            : match.replace
          : match.form || "dynamic";

        bindings.push({
          id: makeId("espanso"),
          app: "espanso",
          key: match.trigger,
          action,
          category: categorizeEspanso(match),
          isCustom: !isDefaultTrigger(match.trigger),
          raw: `${match.trigger} -> ${action}`,
        });
      }
    } catch (err) {
      console.warn(`Failed to parse espanso file ${path}:`, err);
    }
  }

  return bindings;
}

function isDefaultTrigger(trigger: string): boolean {
  return [":espanso", ":date", ":shell"].includes(trigger);
}

function categorizeEspanso(match: EspansoMatch): string {
  if (match.vars?.some((v) => v.type === "date")) return "Date";
  if (match.vars?.some((v) => v.type === "shell")) return "Shell";
  if (match.trigger.startsWith(":mail") || match.trigger.includes("@")) return "Contact";
  if (match.replace?.includes("```")) return "Code Snippet";
  return "Text Expansion";
}
