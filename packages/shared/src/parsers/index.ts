import type { AppId, Binding } from "../types";
import { parseNeovim } from "./neovim";
import { parseVim } from "./vim";
import { parseZed } from "./zed";
import { parseVSCode, parseCursor } from "./vscode";
import { parseAerospace } from "./aerospace";
import { parseTmux } from "./tmux";
import { parseKitty } from "./kitty";
import { parseGhostty } from "./ghostty";
import { parseWezterm } from "./wezterm";
import { parseAlacritty } from "./alacritty";
import { parseZsh } from "./zsh";
import { parseEspanso } from "./espanso";
import { parseLazygit } from "./lazygit";
import { parseSkhd } from "./skhd";
import { parseI3 } from "./i3";
import { parseHyprland } from "./hyprland";
import { parseObsidian } from "./obsidian";
import { parseBash } from "./bash";

export type Parser = (files: Map<string, string>) => Binding[];

export const parsers: Record<AppId, Parser> = {
  neovim: parseNeovim,
  vim: parseVim,
  zed: parseZed,
  vscode: parseVSCode,
  cursor: parseCursor,
  aerospace: parseAerospace,
  tmux: parseTmux,
  kitty: parseKitty,
  ghostty: parseGhostty,
  wezterm: parseWezterm,
  alacritty: parseAlacritty,
  zsh: parseZsh,
  espanso: parseEspanso,
  lazygit: parseLazygit,
  skhd: parseSkhd,
  i3: parseI3,
  hyprland: parseHyprland,
  obsidian: parseObsidian,
  bash: parseBash,
};

let idCounter = 0;
export function makeId(app: AppId): string {
  return `${app}-${idCounter++}`;
}

export function resetIdCounter(): void {
  idCounter = 0;
}
