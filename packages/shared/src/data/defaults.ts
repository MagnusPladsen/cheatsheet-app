import type { AppId, Binding } from "../types";

let id = 0;
const d = (app: AppId, key: string, action: string, opts?: { mode?: string; category?: string }): Binding => ({
  id: `default-${id++}`,
  app,
  key,
  action,
  mode: opts?.mode,
  category: opts?.category || "General",
  isCustom: false,
});

const ALL_DEFAULTS: () => Binding[] = () => [
  // === NEOVIM DEFAULTS ===
  // Movement
  d("neovim", "H", "Move cursor left", { mode: "normal", category: "Movement" }),
  d("neovim", "J", "Move cursor down", { mode: "normal", category: "Movement" }),
  d("neovim", "K", "Move cursor up", { mode: "normal", category: "Movement" }),
  d("neovim", "L", "Move cursor right", { mode: "normal", category: "Movement" }),
  d("neovim", "W", "Jump forward one word", { mode: "normal", category: "Movement" }),
  d("neovim", "B", "Jump backward one word", { mode: "normal", category: "Movement" }),
  d("neovim", "E", "Jump to end of word", { mode: "normal", category: "Movement" }),
  d("neovim", "0", "Go to beginning of line", { mode: "normal", category: "Movement" }),
  d("neovim", "$", "Go to end of line", { mode: "normal", category: "Movement" }),
  d("neovim", "G+G", "Go to first line", { mode: "normal", category: "Movement" }),
  d("neovim", "G", "Go to last line", { mode: "normal", category: "Movement" }),
  d("neovim", "Ctrl+D", "Scroll half page down", { mode: "normal", category: "Movement" }),
  d("neovim", "Ctrl+U", "Scroll half page up", { mode: "normal", category: "Movement" }),
  d("neovim", "%", "Jump to matching bracket", { mode: "normal", category: "Movement" }),

  // Editing
  d("neovim", "I", "Enter insert mode", { mode: "normal", category: "Editing" }),
  d("neovim", "A", "Append after cursor", { mode: "normal", category: "Editing" }),
  d("neovim", "O", "Open new line below", { mode: "normal", category: "Editing" }),
  d("neovim", "Shift+O", "Open new line above", { mode: "normal", category: "Editing" }),
  d("neovim", "D+D", "Delete line", { mode: "normal", category: "Editing" }),
  d("neovim", "Y+Y", "Yank (copy) line", { mode: "normal", category: "Editing" }),
  d("neovim", "P", "Paste after cursor", { mode: "normal", category: "Editing" }),
  d("neovim", "Shift+P", "Paste before cursor", { mode: "normal", category: "Editing" }),
  d("neovim", "U", "Undo", { mode: "normal", category: "Editing" }),
  d("neovim", "Ctrl+R", "Redo", { mode: "normal", category: "Editing" }),
  d("neovim", ".", "Repeat last change", { mode: "normal", category: "Editing" }),
  d("neovim", "C+W", "Change word", { mode: "normal", category: "Editing" }),
  d("neovim", "C+I+W", "Change inner word", { mode: "normal", category: "Editing" }),

  // Search
  d("neovim", "/", "Search forward", { mode: "normal", category: "Search" }),
  d("neovim", "?", "Search backward", { mode: "normal", category: "Search" }),
  d("neovim", "N", "Next search result", { mode: "normal", category: "Search" }),
  d("neovim", "Shift+N", "Previous search result", { mode: "normal", category: "Search" }),
  d("neovim", "*", "Search word under cursor", { mode: "normal", category: "Search" }),

  // Visual
  d("neovim", "V", "Visual mode (char)", { mode: "normal", category: "Visual" }),
  d("neovim", "Shift+V", "Visual line mode", { mode: "normal", category: "Visual" }),
  d("neovim", "Ctrl+V", "Visual block mode", { mode: "normal", category: "Visual" }),

  // File
  d("neovim", ":W", "Save file", { mode: "normal", category: "File" }),
  d("neovim", ":Q", "Quit", { mode: "normal", category: "File" }),
  d("neovim", ":W+Q", "Save and quit", { mode: "normal", category: "File" }),
  d("neovim", ":Q+!", "Force quit without saving", { mode: "normal", category: "File" }),

  // === VIM DEFAULTS ===
  // Movement
  d("vim", "H", "Move cursor left", { mode: "normal", category: "Movement" }),
  d("vim", "J", "Move cursor down", { mode: "normal", category: "Movement" }),
  d("vim", "K", "Move cursor up", { mode: "normal", category: "Movement" }),
  d("vim", "L", "Move cursor right", { mode: "normal", category: "Movement" }),
  d("vim", "W", "Jump forward one word", { mode: "normal", category: "Movement" }),
  d("vim", "B", "Jump backward one word", { mode: "normal", category: "Movement" }),
  d("vim", "E", "Jump to end of word", { mode: "normal", category: "Movement" }),
  d("vim", "0", "Go to beginning of line", { mode: "normal", category: "Movement" }),
  d("vim", "$", "Go to end of line", { mode: "normal", category: "Movement" }),
  d("vim", "^", "Go to first non-blank char", { mode: "normal", category: "Movement" }),
  d("vim", "G+G", "Go to first line", { mode: "normal", category: "Movement" }),
  d("vim", "G", "Go to last line", { mode: "normal", category: "Movement" }),
  d("vim", "Ctrl+D", "Scroll half page down", { mode: "normal", category: "Movement" }),
  d("vim", "Ctrl+U", "Scroll half page up", { mode: "normal", category: "Movement" }),
  d("vim", "Ctrl+F", "Scroll full page down", { mode: "normal", category: "Movement" }),
  d("vim", "Ctrl+B", "Scroll full page up", { mode: "normal", category: "Movement" }),
  d("vim", "%", "Jump to matching bracket", { mode: "normal", category: "Movement" }),
  d("vim", "F+{char}", "Jump to char forward", { mode: "normal", category: "Movement" }),
  d("vim", "T+{char}", "Jump to before char forward", { mode: "normal", category: "Movement" }),

  // Editing
  d("vim", "I", "Enter insert mode", { mode: "normal", category: "Editing" }),
  d("vim", "A", "Append after cursor", { mode: "normal", category: "Editing" }),
  d("vim", "Shift+I", "Insert at beginning of line", { mode: "normal", category: "Editing" }),
  d("vim", "Shift+A", "Append at end of line", { mode: "normal", category: "Editing" }),
  d("vim", "O", "Open new line below", { mode: "normal", category: "Editing" }),
  d("vim", "Shift+O", "Open new line above", { mode: "normal", category: "Editing" }),
  d("vim", "D+D", "Delete line", { mode: "normal", category: "Editing" }),
  d("vim", "Y+Y", "Yank (copy) line", { mode: "normal", category: "Editing" }),
  d("vim", "P", "Paste after cursor", { mode: "normal", category: "Editing" }),
  d("vim", "Shift+P", "Paste before cursor", { mode: "normal", category: "Editing" }),
  d("vim", "U", "Undo", { mode: "normal", category: "Editing" }),
  d("vim", "Ctrl+R", "Redo", { mode: "normal", category: "Editing" }),
  d("vim", ".", "Repeat last change", { mode: "normal", category: "Editing" }),
  d("vim", "X", "Delete char under cursor", { mode: "normal", category: "Editing" }),
  d("vim", "R", "Replace single character", { mode: "normal", category: "Editing" }),
  d("vim", "C+W", "Change word", { mode: "normal", category: "Editing" }),
  d("vim", "C+I+W", "Change inner word", { mode: "normal", category: "Editing" }),
  d("vim", "D+W", "Delete word", { mode: "normal", category: "Editing" }),
  d("vim", "D+I+W", "Delete inner word", { mode: "normal", category: "Editing" }),
  d("vim", "Shift+J", "Join line below", { mode: "normal", category: "Editing" }),
  d("vim", "~", "Toggle case of char", { mode: "normal", category: "Editing" }),

  // Search
  d("vim", "/", "Search forward", { mode: "normal", category: "Search" }),
  d("vim", "?", "Search backward", { mode: "normal", category: "Search" }),
  d("vim", "N", "Next search result", { mode: "normal", category: "Search" }),
  d("vim", "Shift+N", "Previous search result", { mode: "normal", category: "Search" }),
  d("vim", "*", "Search word under cursor", { mode: "normal", category: "Search" }),
  d("vim", "#", "Search word under cursor (backward)", { mode: "normal", category: "Search" }),

  // Visual
  d("vim", "V", "Visual mode (char)", { mode: "normal", category: "Visual" }),
  d("vim", "Shift+V", "Visual line mode", { mode: "normal", category: "Visual" }),
  d("vim", "Ctrl+V", "Visual block mode", { mode: "normal", category: "Visual" }),

  // Marks & Registers
  d("vim", "M+{a-z}", "Set mark", { mode: "normal", category: "Marks" }),
  d("vim", "'+{a-z}", "Jump to mark line", { mode: "normal", category: "Marks" }),
  d("vim", "`+{a-z}", "Jump to mark position", { mode: "normal", category: "Marks" }),
  d("vim", '"+{a-z}+P', "Paste from register", { mode: "normal", category: "Registers" }),

  // File
  d("vim", ":W", "Save file", { mode: "command", category: "File" }),
  d("vim", ":Q", "Quit", { mode: "command", category: "File" }),
  d("vim", ":W+Q", "Save and quit", { mode: "command", category: "File" }),
  d("vim", ":Q+!", "Force quit without saving", { mode: "command", category: "File" }),
  d("vim", ":E {file}", "Open file", { mode: "command", category: "File" }),

  // === TMUX DEFAULTS ===
  d("tmux", "Ctrl+B, %", "Split pane horizontally", { category: "Pane" }),
  d("tmux", 'Ctrl+B, "', "Split pane vertically", { category: "Pane" }),
  d("tmux", "Ctrl+B, Arrow", "Switch pane direction", { category: "Pane" }),
  d("tmux", "Ctrl+B, X", "Close current pane", { category: "Pane" }),
  d("tmux", "Ctrl+B, Z", "Toggle pane zoom", { category: "Pane" }),
  d("tmux", "Ctrl+B, {", "Move pane left", { category: "Pane" }),
  d("tmux", "Ctrl+B, }", "Move pane right", { category: "Pane" }),
  d("tmux", "Ctrl+B, Space", "Cycle pane layouts", { category: "Pane" }),
  d("tmux", "Ctrl+B, C", "Create new window", { category: "Window" }),
  d("tmux", "Ctrl+B, N", "Next window", { category: "Window" }),
  d("tmux", "Ctrl+B, P", "Previous window", { category: "Window" }),
  d("tmux", "Ctrl+B, 0-9", "Switch to window N", { category: "Window" }),
  d("tmux", "Ctrl+B, &", "Kill window", { category: "Window" }),
  d("tmux", "Ctrl+B, ,", "Rename window", { category: "Window" }),
  d("tmux", "Ctrl+B, L", "Last active window", { category: "Window" }),
  d("tmux", "Ctrl+B, W", "List windows", { category: "Window" }),
  d("tmux", "Ctrl+B, D", "Detach from session", { category: "Session" }),
  d("tmux", "Ctrl+B, S", "List sessions", { category: "Session" }),
  d("tmux", "Ctrl+B, $", "Rename session", { category: "Session" }),
  d("tmux", "Ctrl+B, [", "Enter copy mode", { category: "Copy" }),
  d("tmux", "Ctrl+B, ]", "Paste buffer", { category: "Copy" }),
  d("tmux", "Ctrl+B, ?", "List keybindings", { category: "Help" }),
  d("tmux", "Ctrl+B, T", "Show clock", { category: "Help" }),

  // === KITTY DEFAULTS ===
  d("kitty", "Cmd+C", "Copy to clipboard", { category: "Clipboard" }),
  d("kitty", "Cmd+V", "Paste from clipboard", { category: "Clipboard" }),
  d("kitty", "Cmd+N", "New OS window", { category: "Window" }),
  d("kitty", "Cmd+W", "Close OS window", { category: "Window" }),
  d("kitty", "Cmd+Enter", "New tab", { category: "Tab" }),
  d("kitty", "Cmd+Shift+]", "Next tab", { category: "Tab" }),
  d("kitty", "Cmd+Shift+[", "Previous tab", { category: "Tab" }),
  d("kitty", "Cmd+Equal", "Increase font size", { category: "Font" }),
  d("kitty", "Cmd+Minus", "Decrease font size", { category: "Font" }),
  d("kitty", "Cmd+0", "Reset font size", { category: "Font" }),
  d("kitty", "Ctrl+Shift+F5", "Reload kitty.conf", { category: "Config" }),

  // === ZSH DEFAULTS (Oh My Zsh git plugin) ===
  d("zsh", "gst", "git status", { category: "Git (OMZ)" }),
  d("zsh", "ga", "git add", { category: "Git (OMZ)" }),
  d("zsh", "gc", "git commit", { category: "Git (OMZ)" }),
  d("zsh", "gco", "git checkout", { category: "Git (OMZ)" }),
  d("zsh", "gp", "git push", { category: "Git (OMZ)" }),
  d("zsh", "gl", "git pull", { category: "Git (OMZ)" }),
  d("zsh", "gd", "git diff", { category: "Git (OMZ)" }),
  d("zsh", "gb", "git branch", { category: "Git (OMZ)" }),
  d("zsh", "glog", "git log --oneline --graph", { category: "Git (OMZ)" }),
  d("zsh", "gcb", "git checkout -b", { category: "Git (OMZ)" }),
  d("zsh", "Ctrl+R", "Reverse search history (fzf)", { category: "Shell" }),
  d("zsh", "Ctrl+T", "File search (fzf)", { category: "Shell" }),
  d("zsh", "Alt+C", "cd into directory (fzf)", { category: "Shell" }),
];

/**
 * Returns default bindings, optionally filtered to only apps the user actually has.
 * If no activeApps provided, returns all defaults.
 */
export function getDefaultBindings(activeApps?: Set<AppId>): Binding[] {
  id = 0;
  const all = ALL_DEFAULTS();
  if (!activeApps || activeApps.size === 0) return all;
  return all.filter((b) => activeApps.has(b.app));
}
