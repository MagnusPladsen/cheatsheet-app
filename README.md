# cheatsheet

[![Release](https://github.com/MagnusPladsen/my-cheatsheet/actions/workflows/release.yml/badge.svg)](https://github.com/MagnusPladsen/my-cheatsheet/actions/workflows/release.yml)
[![Latest Release](https://img.shields.io/github/v/release/MagnusPladsen/my-cheatsheet?label=latest)](https://github.com/MagnusPladsen/my-cheatsheet/releases/latest)
[![Vercel](https://img.shields.io/github/deployments/MagnusPladsen/my-cheatsheet/production?label=vercel&logo=vercel)](https://my-cheatsheet-web-git-main-magnus-pladsens-projects.vercel.app)
[![AUR](https://img.shields.io/aur/version/cheatsheet-app-bin?logo=archlinux&label=AUR)](https://aur.archlinux.org/packages/cheatsheet-app-bin)
[![Homebrew](https://img.shields.io/badge/homebrew-tap-orange?logo=homebrew)](https://github.com/MagnusPladsen/homebrew-cheatsheet)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![macOS](https://img.shields.io/badge/macOS-arm64%20%7C%20x64-black?logo=apple)
![Linux](https://img.shields.io/badge/Linux-x64-black?logo=linux&logoColor=white)

A developer keybinding cheatsheet that parses your actual config files and displays all your bindings in a searchable, filterable UI. Available as a [web app](https://my-cheatsheet-web-git-main-magnus-pladsens-projects.vercel.app) and a native desktop app (Tauri).

<!-- IMAGE: hero screenshot of the app showing the main UI with bindings -->

## Supported Tools

| Tool | Config Parsed |
|------|--------------|
| Neovim | `init.lua` / keymaps |
| Tmux | `.tmux.conf` |
| AeroSpace | `aerospace.toml` |
| Kitty | `kitty.conf` |
| Zed | `keymap.json` |
| Zsh | `.zshrc` aliases |
| Espanso | `match/*.yml` |

## Features

- **Fuzzy search** across all bindings with highlighted matches
- **Filter by app** to focus on specific tools
- **Conflict detection** to find overlapping keybindings across tools
- **Practice mode** to test your keybinding knowledge
- **Export** bindings as JSON or markdown
- **Share** bindings via URL
- **Themes** with light and dark mode

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

The web version reads bindings from the bundled defaults. The desktop app reads your actual local config files.

## Quick Start

1. **Launch the app** — it automatically reads your config files and displays all keybindings

<!-- IMAGE: screenshot of app on first launch with bindings loaded -->

2. **Search** — start typing to fuzzy-search across all bindings. Matches are highlighted in real-time

<!-- IMAGE: screenshot of search in action -->

3. **Filter by app** — click the app icons in the filter bar to show only bindings from specific tools

<!-- IMAGE: screenshot showing filter bar with some apps selected -->

4. **Detect conflicts** — open the conflict panel to find keybindings that overlap across different tools

<!-- IMAGE: screenshot of conflict detection -->

5. **Practice mode** — test yourself on bindings. The app shows you a command and you type the correct keybinding

<!-- IMAGE: screenshot of practice mode -->

6. **Export & Share** — export your bindings as JSON/markdown, or generate a shareable URL

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
git tag v1.0.7
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
