export type AppId =
  | "vim"
  | "neovim"
  | "zed"
  | "aerospace"
  | "tmux"
  | "kitty"
  | "zsh"
  | "espanso";

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
  files: FileSource[];
}

export interface FileSource {
  path: string;
  repoOwner: string;
  repoName: string;
  branch?: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
