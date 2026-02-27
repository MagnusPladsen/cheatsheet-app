# cheatsheet

Developer keybinding cheatsheet for neovim, tmux, aerospace, kitty, zed, zsh, and espanso. Parses your actual config files and displays all your bindings in a searchable UI.

Available as a [web app](https://github.com/MagnusPladsen/my-cheatsheet) and a native desktop app (Tauri).

## Install

### macOS (Homebrew)

```bash
brew tap MagnusPladsen/cheatsheet
brew install --cask cheatsheet
```

> No code signing yet — on first launch, right-click the app and select "Open" to bypass Gatekeeper.

### Arch Linux (AUR)

```bash
yay -S cheatsheet-bin
# or: paru -S cheatsheet-bin
```

### Debian / Ubuntu / Linux Mint

```bash
# Download .deb from the latest release, then:
sudo dpkg -i cheatsheet_1.0.0_amd64.deb
sudo apt-get install -f  # install missing dependencies if needed
```

System dependencies: `libwebkit2gtk-4.1-0`, `libgtk-3-0`, `libatk1.0-0`

### Fedora / RHEL

```bash
sudo rpm -i cheatsheet-1.0.0.x86_64.rpm
```

### AppImage (any Linux)

```bash
chmod +x cheatsheet_1.0.0_amd64.AppImage
./cheatsheet_1.0.0_amd64.AppImage
```

## Development

```bash
bun install
bun run dev:desktop   # desktop app (requires Rust + Tauri CLI)
bun run dev:web       # web app
```

### Linux dev dependencies

On Debian/Ubuntu/Mint, install these before building:

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
git tag v1.0.0
git push origin v1.0.0
```

This builds for macOS (arm64 + x64) and Linux (x64), creates a draft GitHub Release with all artifacts, and updates the Homebrew tap.
