// Converts a KeyboardEvent into a normalized key string like "Ctrl+Shift+K"
export function captureKeyCombo(e: KeyboardEvent): string {
  const parts: string[] = [];

  if (e.ctrlKey) parts.push("Ctrl");
  if (e.metaKey) parts.push("Cmd");
  if (e.altKey) parts.push("Alt");
  if (e.shiftKey) parts.push("Shift");

  const key = e.key;

  // Skip standalone modifier keys
  if (["Control", "Meta", "Alt", "Shift"].includes(key)) {
    return parts.join("+");
  }

  // Normalize key names
  const keyMap: Record<string, string> = {
    " ": "Space",
    ArrowUp: "Up",
    ArrowDown: "Down",
    ArrowLeft: "Left",
    ArrowRight: "Right",
    Escape: "Esc",
    Backspace: "Backspace",
    Tab: "Tab",
    Enter: "Enter",
    Delete: "Delete",
  };

  const normalized = keyMap[key] ?? (key.length === 1 ? key.toUpperCase() : key);
  parts.push(normalized);

  return parts.join("+");
}

// Normalize a binding key string for comparison
export function normalizeForComparison(key: string): string {
  // Take first segment of multi-key combos
  const segment = key.split(/,\s*/)[0];
  return segment
    .split("+")
    .map((p) => {
      const k = p.trim().toLowerCase();
      const aliases: Record<string, string> = {
        command: "cmd", super: "cmd", meta: "cmd",
        control: "ctrl",
        option: "alt", opt: "alt",
        cr: "enter", return: "enter",
        esc: "escape",
        bs: "backspace",
      };
      return aliases[k] ?? k;
    })
    .sort()
    .join("+");
}
