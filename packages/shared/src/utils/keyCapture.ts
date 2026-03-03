// Map e.code (physical key) to a readable key name
const CODE_TO_KEY: Record<string, string> = {
  Space: "Space", Backspace: "Backspace", Tab: "Tab", Enter: "Enter",
  Escape: "Esc", Delete: "Delete",
  ArrowUp: "Up", ArrowDown: "Down", ArrowLeft: "Left", ArrowRight: "Right",
  Minus: "-", Equal: "=", BracketLeft: "[", BracketRight: "]",
  Backslash: "\\", Semicolon: ";", Quote: "'", Comma: ",", Period: ".", Slash: "/",
  Backquote: "`",
};

function keyFromCode(code: string): string | null {
  if (CODE_TO_KEY[code]) return CODE_TO_KEY[code];
  // KeyA-KeyZ → A-Z
  if (code.startsWith("Key")) return code.slice(3).toUpperCase();
  // Digit0-Digit9 → 0-9
  if (code.startsWith("Digit")) return code.slice(5);
  return null;
}

// Converts a KeyboardEvent into a normalized key string like "Ctrl+Shift+K"
export function captureKeyCombo(e: KeyboardEvent): string {
  const parts: string[] = [];

  if (e.ctrlKey) parts.push("Ctrl");
  if (e.metaKey) parts.push("Cmd");
  if (e.altKey) parts.push("Alt");

  // Only include Shift as an explicit modifier when intentional:
  // - With another modifier held (Ctrl+Shift+K)
  // - With a letter key (Shift+V for vim visual line)
  // - With a special key (Shift+Tab, Shift+Enter)
  // Don't include Shift when it's just producing a character (Shift+' → ", Shift+5 → %)
  if (e.shiftKey) {
    const hasOtherModifier = e.ctrlKey || e.metaKey || e.altKey;
    const keyVal = e.key;
    const isLetter = keyVal.length === 1 && /[a-zA-Z]/.test(keyVal);
    const isSpecial = keyVal.length > 1;
    if (hasOtherModifier || isLetter || isSpecial) {
      parts.push("Shift");
    }
  }

  const key = e.key;

  // Skip standalone modifier keys
  if (["Control", "Meta", "Alt", "Shift"].includes(key)) {
    return parts.join("+");
  }

  // On macOS, Alt produces special characters (e.g. Alt+K → ˚).
  // Use e.code to get the physical key when Alt is held.
  if (e.altKey && e.code) {
    const fromCode = keyFromCode(e.code);
    if (fromCode) {
      parts.push(fromCode);
      return parts.join("+");
    }
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

const MODIFIERS = new Set([
  "ctrl", "cmd", "alt", "shift", "command", "meta", "super", "option",
]);

// Splits a binding key into sequential steps the user must press
export function parseBindingSteps(key: string): string[] {
  const trimmed = key.trim();

  // Comma-separated → tmux prefix sequences like "Ctrl+B, %"
  if (trimmed.includes(",")) {
    return trimmed.split(/,\s*/).map((s) => s.trim()).filter(Boolean);
  }

  // Vim commands (starts with :) — treat as single step
  if (trimmed.startsWith(":")) {
    return [trimmed];
  }

  // Split by + and check if parts are non-modifier sequential keys
  const parts = trimmed.split("+").map((p) => p.trim());
  const hasModifier = parts.some((p) => MODIFIERS.has(p.toLowerCase()));

  if (!hasModifier && parts.length > 1) {
    // Sequential keys like G+G, D+D, C+I+W
    return parts;
  }

  // Single modifier combo like Ctrl+D, Shift+V
  return [trimmed];
}

// Normalize a single step for comparison (used in practice mode matching)
export function normalizeStep(step: string): string {
  return step
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
