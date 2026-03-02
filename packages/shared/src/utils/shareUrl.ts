import type { Binding } from "../types";

interface SharedData {
  v: 1;
  b: Array<{
    a: string; // app
    k: string; // key
    d: string; // action (description)
    m?: string; // mode
    c?: string; // category
  }>;
}

export function encodeBindings(bindings: Binding[]): string {
  const data: SharedData = {
    v: 1,
    b: bindings.map((b) => {
      const entry: SharedData["b"][0] = { a: b.app, k: b.key, d: b.action };
      if (b.mode) entry.m = b.mode;
      if (b.category) entry.c = b.category;
      return entry;
    }),
  };

  const json = JSON.stringify(data);
  const compressed = btoa(encodeURIComponent(json));
  return compressed;
}

export function decodeBindings(hash: string): Binding[] | null {
  try {
    const json = decodeURIComponent(atob(hash));
    const data: SharedData = JSON.parse(json);
    if (data.v !== 1 || !Array.isArray(data.b)) return null;

    return data.b.map((entry, i) => ({
      id: `shared-${i}`,
      app: entry.a as Binding["app"],
      key: entry.k,
      action: entry.d,
      mode: entry.m,
      category: entry.c,
      isCustom: true,
    }));
  } catch {
    return null;
  }
}

export function getShareHash(): string | null {
  const hash = window.location.hash.slice(1);
  if (hash.startsWith("share=")) {
    return hash.slice(6);
  }
  return null;
}

export function buildShareUrl(encoded: string): string {
  const base = window.location.origin + window.location.pathname;
  return `${base}#share=${encoded}`;
}
