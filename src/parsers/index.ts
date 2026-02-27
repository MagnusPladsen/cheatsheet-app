import type { AppId, Binding } from "../types";
import { parseVim } from "./vim";
import { parseNeovim } from "./neovim";
import { parseZed } from "./zed";
import { parseAerospace } from "./aerospace";
import { parseTmux } from "./tmux";
import { parseKitty } from "./kitty";
import { parseZsh } from "./zsh";
import { parseEspanso } from "./espanso";

export type Parser = (files: Map<string, string>) => Binding[];

export const parsers: Record<AppId, Parser> = {
  vim: parseVim,
  neovim: parseNeovim,
  zed: parseZed,
  aerospace: parseAerospace,
  tmux: parseTmux,
  kitty: parseKitty,
  zsh: parseZsh,
  espanso: parseEspanso,
};

let idCounter = 0;
export function makeId(app: AppId): string {
  return `${app}-${idCounter++}`;
}

export function resetIdCounter(): void {
  idCounter = 0;
}
