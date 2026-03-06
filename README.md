# cheatsheet

[![Release](https://github.com/MagnusPladsen/my-cheatsheet/actions/workflows/release.yml/badge.svg)](https://github.com/MagnusPladsen/my-cheatsheet/actions/workflows/release.yml)
[![Latest Release](https://img.shields.io/github/v/release/MagnusPladsen/my-cheatsheet?label=latest)](https://github.com/MagnusPladsen/my-cheatsheet/releases/latest)
[![Vercel](https://img.shields.io/github/deployments/MagnusPladsen/my-cheatsheet/production?label=vercel&logo=vercel)](https://my-cheatsheet-web-git-main-magnus-pladsens-projects.vercel.app)
[![AUR](https://img.shields.io/aur/version/cheatsheet-app-bin?logo=archlinux&label=AUR)](https://aur.archlinux.org/packages/cheatsheet-app-bin)
[![Homebrew](https://img.shields.io/badge/homebrew-tap-orange?logo=homebrew)](https://github.com/MagnusPladsen/homebrew-cheatsheet)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![macOS](https://img.shields.io/badge/macOS-arm64%20%7C%20x64-black?logo=apple)
![Linux](https://img.shields.io/badge/Linux-x64-black?logo=linux&logoColor=white)

A developer keybinding cheatsheet that parses your actual config files and displays all your bindings in a searchable, filterable UI. Available as a [web app](https://my-cheatsheet-web-git-main-magnus-pladsens-projects.vercel.app) (connect your GitHub dotfiles repo) and a native [desktop app](https://github.com/MagnusPladsen/my-cheatsheet/releases/latest) (reads local config files directly).

> **Early development** — this app is stable and working, but still under active development. Some features are incomplete and parsers may not catch every config format. Feedback and bug reports are welcome via [GitHub Issues](https://github.com/MagnusPladsen/my-cheatsheet/issues).

<!-- IMAGE: hero screenshot of the app showing the main UI with bindings -->

## Supported Tools

| Tool | Config Parsed |
|------|--------------|
| Neovim | `init.lua` / keymaps / AstroNvim |
| Vim | `.vimrc` |
| Zed | `keymap.json` |
| VS Code | `keybindings.json` |
| Cursor | `keybindings.json` |
| Tmux | `.tmux.conf` |
| Kitty | `kitty.conf` |
| Ghostty | `ghostty/config` |
| WezTerm | `.wezterm.lua` |
| Alacritty | `alacritty.toml` |
| Zsh | `.zshrc` aliases |
| Bash | `.bashrc` / `.bash_aliases` / `.bash_profile` |
| Espanso | `match/*.yml` |
| Lazygit | `config.yml` |
| AeroSpace | `aerospace.toml` |
| skhd / Yabai | `.skhdrc` |
| i3 / Sway | `i3/config` / `sway/config` |
| Hyprland | `hyprland.conf` |
| Obsidian | `hotkeys.json` |

## Features

- **Fuzzy search** across all bindings with highlighted matches
- **Filter by app** to focus on specific tools
- **Overlap detection** to find shared keybindings across tools (note: overlapping keys in different apps are not necessarily conflicts — most tools have independent key scopes)
- **Practice mode** *(experimental)* to test your keybinding knowledge — has known issues with some key combos
- **Export** bindings as JSON, PNG, or PDF
- **Share** bindings via URL
- **12 themes** — hacker, tokyo night, dracula, catppuccin, nord, gruvbox, kanagawa, monokai, rose pine, and more

### Desktop App

The desktop app reads config files directly from your filesystem — no GitHub repo or network needed.

- **Follows source/include directives** — automatically picks up bindings from sourced tmux configs (`source-file`), zsh plugins (`source`/`.`), neovim lua modules (`require()`/`dofile()`), and vim runtime files (`source`/`runtime`)
- **Recursive resolution** up to 3 levels deep with cycle detection
- **Expands `~` and `$HOME`** in include paths
- **Watches for file changes** and re-parses automatically
- **System tray** with global shortcut (`Cmd+Shift+K`) to toggle the app
- **Multiple config folders** — add custom directories beyond `$HOME`

### Web App

The web app runs in your browser with no install required.

- **Connect your GitHub dotfiles repo** — enter `owner/repo` or a full URL and see your own keybindings
- **Saved to localStorage** — your repo choice persists across sessions
- **Share bindings via URL** — generate links others can open directly
- Works with any public GitHub repo containing dotfiles

<!-- IMAGE: screenshot showing search with highlighted matches -->

<!-- IMAGE: screenshot showing conflict detection panel -->

## Install

### macOS (Homebrew)

```bash
brew tap magnuspladsen/cheatsheet
brew install cheatsheet-app
```

> **Note:** The app is not code-signed yet. On first launch you may see "cheatsheet is damaged". Fix with:
> ```bash
> xattr -cr /Applications/cheatsheet.app
> ```

### macOS (Direct Download)

Download the `.dmg` for your architecture from the [latest release](https://github.com/MagnusPladsen/my-cheatsheet/releases/latest):
- **Apple Silicon (M1/M2/M3/M4):** `cheatsheet_x.x.x_aarch64.dmg`
- **Intel:** `cheatsheet_x.x.x_x64.dmg`

### Arch Linux (AUR)

```bash
yay -S cheatsheet-app-bin
# or: paru -S cheatsheet-app-bin
```

### Debian / Ubuntu / Linux Mint

Download the `.deb` from the [latest release](https://github.com/MagnusPladsen/my-cheatsheet/releases/latest), then:

```bash
sudo dpkg -i cheatsheet_*_amd64.deb
sudo apt-get install -f  # install missing dependencies if needed
```

### Fedora / RHEL

```bash
sudo rpm -i cheatsheet-*.x86_64.rpm
```

### AppImage (any Linux)

```bash
chmod +x cheatsheet_*_amd64.AppImage
./cheatsheet_*_amd64.AppImage
```

### Web App

No install needed — use it directly at [my-cheatsheet-web-git-main-magnus-pladsens-projects.vercel.app](https://my-cheatsheet-web-git-main-magnus-pladsens-projects.vercel.app).

The web version can connect to any public GitHub dotfiles repo to display your keybindings. Enter your repo URL (e.g. `username/dotfiles`) in the app and it's saved to your browser. No signup required.

> **Note:** The web app requires a **public** GitHub repo. For private configs or local-only setups, use the desktop app — it reads directly from your filesystem with no network needed.

## Quick Start

1. **Launch the app** — it automatically reads your config files and displays all keybindings

<!-- IMAGE: screenshot of app on first launch with bindings loaded -->

2. **Search** — start typing to fuzzy-search across all bindings. Matches are highlighted in real-time

<!-- IMAGE: screenshot of search in action -->

3. **Filter by app** — click the app icons in the filter bar to show only bindings from specific tools

<!-- IMAGE: screenshot showing filter bar with some apps selected -->

4. **Detect overlaps** — open the overlap panel to find shared keybindings across tools (note: same key in different apps is usually fine — they have independent scopes)

<!-- IMAGE: screenshot of overlap detection -->

5. **Practice mode** *(experimental)* — test yourself on bindings. The app shows you a command and you type the correct keybinding. Some key combos may not register correctly

<!-- IMAGE: screenshot of practice mode -->

6. **Export & Share** — export your bindings as JSON/markdown, or generate a shareable URL

## What's New in v1.1.0

- **Landing page** — new homepage with features overview, supported tools, and download guides
- **Configurable GitHub repo (web)** — connect your own public dotfiles repo instead of using the default
- **Follow source/include directives (desktop)** — tmux `source-file`, zsh `source`/`.`, neovim `require()`/`dofile()`, vim `source`/`runtime` are now followed recursively (up to 3 levels, with cycle detection)
- **11 new parsers** — Vim, VS Code, Cursor, Ghostty, WezTerm, Alacritty, Lazygit, skhd, i3/Sway, Hyprland, Obsidian
- **Web vs Desktop comparison** — landing page highlights why the desktop app is recommended

## Tech Stack

| Layer | Tech |
|-------|------|
| Desktop | [Tauri v2](https://v2.tauri.app) (Rust) |
| Web | [React 19](https://react.dev) + [Vite](https://vite.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Monorepo | Bun workspaces |
| CI/CD | GitHub Actions |
| Hosting | Vercel (web), GitHub Releases (desktop) |
| Package Managers | Homebrew (macOS), AUR (Arch Linux) |

## Project Structure

```
apps/
  desktop/          Tauri desktop app
  web/              Vite + React web app
packages/
  shared/           Shared components, parsers, hooks, types
    src/parsers/    Config file parsers (neovim, tmux, aerospace, ...)
    src/components/ Shared UI components
    src/hooks/      Shared React hooks
```

## Development

```bash
bun install
bun run dev:desktop   # desktop app (requires Rust + Tauri CLI)
bun run dev:web       # web app
```

### Prerequisites

- [Bun](https://bun.sh)
- [Rust](https://rustup.rs) (for desktop app)
- Tauri CLI: `cargo install tauri-cli`

### Linux dev dependencies

On Debian/Ubuntu, install these before building the desktop app:

```bash
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libatk1.0-dev \
  libappindicator3-dev \
  librsvg2-dev \
  patchelf
```

## Releasing

Push a version tag to trigger a GitHub Actions build:

```bash
# Bump version in package.json and apps/desktop/src-tauri/tauri.conf.json, then:
git tag v1.1.1
git push origin main --tags
```

This will:
1. Build for macOS (arm64 + x64) and Linux (x64)
2. Create a draft GitHub Release with all artifacts (`.dmg`, `.deb`, `.rpm`, `.AppImage`)
3. Update the [Homebrew tap](https://github.com/MagnusPladsen/homebrew-cheatsheet) with new SHA256s
4. Update the [AUR package](https://aur.archlinux.org/packages/cheatsheet-app-bin) with new version and SHA256

> **Note:** The release is created as a draft. Publish it manually from the GitHub Releases page to make downloads public.

## License

MIT
