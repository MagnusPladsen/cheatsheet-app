import type { Binding } from "../types";

const modifierAliases: Record<string, string> = {
  cmd: "cmd",
  command: "cmd",
  super: "cmd",
  meta: "cmd",
  ctrl: "ctrl",
  control: "ctrl",
  alt: "alt",
  opt: "alt",
  option: "alt",
  shift: "shift",
};

const knownModifiers = new Set(Object.values(modifierAliases));

export function normalizeKey(key: string): string {
  const parts = key
    .toLowerCase()
    .split("+")
    .map((p) => p.trim())
    .filter(Boolean);

  const modifiers: string[] = [];
  const keys: string[] = [];

  for (const part of parts) {
    const alias = modifierAliases[part];
    if (alias) {
      if (!modifiers.includes(alias)) modifiers.push(alias);
    } else {
      keys.push(part);
    }
  }

  modifiers.sort();
  return [...modifiers, ...keys].join("+");
}

export interface ConflictGroup {
  normalizedKey: string;
  bindings: Binding[];
}

export function detectConflicts(bindings: Binding[]): ConflictGroup[] {
  const groups = new Map<string, Binding[]>();

  for (const binding of bindings) {
    // Normalize each segment for multi-key combos
    const segments = binding.key.split(/,\s*/);
    for (const segment of segments) {
      const normalized = normalizeKey(segment);
      if (!normalized) continue;
      const group = groups.get(normalized) ?? [];
      group.push(binding);
      groups.set(normalized, group);
    }
  }

  const conflicts: ConflictGroup[] = [];

  for (const [normalizedKey, group] of groups) {
    if (group.length < 2) continue;

    // Only count as conflict if 2+ different apps are involved
    const apps = new Set(group.map((b) => b.app));
    if (apps.size < 2) continue;

    conflicts.push({ normalizedKey, bindings: group });
  }

  return conflicts.sort((a, b) => b.bindings.length - a.bindings.length);
}
