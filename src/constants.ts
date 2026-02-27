import type { AppConfig, AppId } from "./types";

export const GITHUB_OWNER = "MagnusPladsen";

const dotfile = (path: string): { path: string; repoOwner: string; repoName: string } => ({
  path,
  repoOwner: GITHUB_OWNER,
  repoName: "dotfiles",
});

export const APPS: Record<AppId, AppConfig> = {
  neovim: {
    id: "neovim",
    name: "Neovim",
    icon: "⌨️",
    color: "text-green-400",
    files: [
      dotfile(".config/nvim/lua/plugins/astrocore.lua"),
      dotfile(".config/nvim/lua/plugins/astrolsp.lua"),
      dotfile(".config/nvim/lua/mappings.lua"),
      dotfile(".config/nvim/init.lua"),
      dotfile(".vimrc"),
    ],
  },
  zed: {
    id: "zed",
    name: "Zed",
    icon: "⚡",
    color: "text-blue-400",
    files: [dotfile(".config/zed/keymap.json")],
  },
  aerospace: {
    id: "aerospace",
    name: "AeroSpace",
    icon: "🪟",
    color: "text-purple-400",
    files: [dotfile(".config/aerospace/config.toml")],
  },
  tmux: {
    id: "tmux",
    name: "tmux",
    icon: "🖥️",
    color: "text-cyan-400",
    files: [dotfile(".tmux.conf")],
  },
  kitty: {
    id: "kitty",
    name: "Kitty",
    icon: "🐱",
    color: "text-amber-400",
    files: [dotfile(".config/kitty/kitty.conf")],
  },
  zsh: {
    id: "zsh",
    name: "Zsh Aliases",
    icon: "🐚",
    color: "text-pink-400",
    files: [dotfile(".zshrc")],
  },
  espanso: {
    id: "espanso",
    name: "Espanso",
    icon: "✏️",
    color: "text-orange-400",
    files: [dotfile(".config/espanso/match/base.yml")],
  },
};

export const APP_LIST = Object.values(APPS);
export const CACHE_TTL = 5 * 60 * 1000;
export const GITHUB_API_BASE = "https://api.github.com";
