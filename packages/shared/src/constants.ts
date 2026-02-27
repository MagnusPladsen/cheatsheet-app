import type { AppConfig, AppId } from "./types.ts";

export const APPS: Record<AppId, AppConfig> = {
  neovim: {
    id: "neovim",
    name: "Neovim",
    icon: "\u2328\uFE0F",
    color: "text-green-400",
    filePaths: [
      ".config/nvim/lua/plugins/astrocore.lua",
      ".config/nvim/lua/plugins/astrolsp.lua",
      ".config/nvim/lua/mappings.lua",
      ".config/nvim/init.lua",
      ".vimrc",
    ],
  },
  zed: {
    id: "zed",
    name: "Zed",
    icon: "\u26A1",
    color: "text-blue-400",
    filePaths: [".config/zed/keymap.json"],
  },
  aerospace: {
    id: "aerospace",
    name: "AeroSpace",
    icon: "\uD83E\uDE9F",
    color: "text-purple-400",
    filePaths: [".config/aerospace/config.toml"],
  },
  tmux: {
    id: "tmux",
    name: "tmux",
    icon: "\uD83D\uDDA5\uFE0F",
    color: "text-cyan-400",
    filePaths: [".tmux.conf"],
  },
  kitty: {
    id: "kitty",
    name: "Kitty",
    icon: "\uD83D\uDC31",
    color: "text-amber-400",
    filePaths: [".config/kitty/kitty.conf"],
  },
  zsh: {
    id: "zsh",
    name: "Zsh Aliases",
    icon: "\uD83D\uDC1A",
    color: "text-pink-400",
    filePaths: [".zshrc"],
  },
  espanso: {
    id: "espanso",
    name: "Espanso",
    icon: "\u270F\uFE0F",
    color: "text-orange-400",
    filePaths: [".config/espanso/match/base.yml"],
  },
};

export const APP_LIST = Object.values(APPS);
