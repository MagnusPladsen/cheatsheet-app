export type AppId =
  | "neovim"
  | "vim"
  | "zed"
  | "vscode"
  | "cursor"
  | "aerospace"
  | "tmux"
  | "kitty"
  | "ghostty"
  | "wezterm"
  | "alacritty"
  | "zsh"
  | "espanso"
  | "lazygit"
  | "skhd"
  | "i3"
  | "hyprland"
  | "obsidian";

export interface Binding {
  id: string;
  app: AppId;
  key: string;
  action: string;
  mode?: string;
  category?: string;
  isCustom: boolean;
  raw?: string;
}

export interface AppConfig {
  id: AppId;
  name: string;
  icon: string;
  color: string;
  filePaths: string[];
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface MatchInfo {
  key: string;
  indices: readonly [number, number][];
}

export interface SearchResult {
  binding: Binding;
  matches?: MatchInfo[];
}
