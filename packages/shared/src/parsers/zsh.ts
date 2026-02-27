import type { Binding } from "../types";
import { makeId } from "./index";

export function parseZsh(files: Map<string, string>): Binding[] {
  const bindings: Binding[] = [];
  const content = files.get(".zshrc");
  if (!content) return bindings;

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();

    const aliasMatch = line.match(/^alias\s+(\S+?)=['"](.*?)['"]/);
    if (aliasMatch) {
      const [, name, command] = aliasMatch;
      bindings.push({
        id: makeId("zsh"),
        app: "zsh",
        key: name,
        action: command,
        category: categorizeZshAlias(name, command),
        isCustom: true,
        raw: line,
      });
    }

    const fzfMatch = line.match(/^export\s+(FZF_\w+_COMMAND)="(.+)"/);
    if (fzfMatch) {
      const keyMap: Record<string, string> = {
        FZF_CTRL_T_COMMAND: "Ctrl+T",
        FZF_ALT_C_COMMAND: "Alt+C",
        FZF_CTRL_R_COMMAND: "Ctrl+R",
      };
      const shortcut = keyMap[fzfMatch[1]];
      if (shortcut) {
        bindings.push({
          id: makeId("zsh"),
          app: "zsh",
          key: shortcut,
          action: `FZF: ${fzfMatch[2].slice(0, 60)}...`,
          category: "FZF",
          isCustom: true,
          raw: line,
        });
      }
    }
  }

  return bindings;
}

function categorizeZshAlias(name: string, command: string): string {
  if (command.includes("git") || name === "dotfiles") return "Git";
  if (command.includes("eza") || name === "ls" || name === "ll") return "File Listing";
  if (command.includes("tmux") || name.startsWith("t")) return "Tmux";
  if (command.includes("claude")) return "Claude";
  if (command.includes("source") || name === "sauce") return "Shell";
  if (command.includes("open") || command.includes("pkill")) return "macOS";
  return "General";
}
