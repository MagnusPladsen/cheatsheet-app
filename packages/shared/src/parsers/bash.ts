import type { Binding } from "../types";
import { makeId } from "./index";

export function parseBash(files: Map<string, string>): Binding[] {
  const bindings: Binding[] = [];

  for (const [, content] of files) {
    if (!content) continue;

    for (const rawLine of content.split("\n")) {
      const line = rawLine.trim();

      const aliasMatch = line.match(/^alias\s+(\S+?)=['"](.*?)['"]/);
      if (aliasMatch) {
        const [, name, command] = aliasMatch;
        bindings.push({
          id: makeId("bash"),
          app: "bash",
          key: name,
          action: command,
          category: categorizeBashAlias(name, command),
          isCustom: true,
          raw: line,
        });
      }
    }
  }

  return bindings;
}

function categorizeBashAlias(name: string, command: string): string {
  if (command.includes("git")) return "Git";
  if (command.includes("ls") || command.includes("eza") || name === "ll") return "File Listing";
  if (command.includes("docker") || command.includes("kubectl")) return "DevOps";
  if (command.includes("cd") || command.includes("mkdir")) return "Navigation";
  if (command.includes("source") || command.includes("export")) return "Shell";
  return "General";
}
