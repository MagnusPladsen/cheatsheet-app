import type { CacheEntry } from "@cheatsheet/shared";

const CACHE_TTL = 5 * 60 * 1000;
const CACHE_KEY_PREFIX = "cheatsheet_";

export function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function setCache<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(entry));
  } catch {
    clearCache();
  }
}

export function clearCache(): void {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_KEY_PREFIX));
  keys.forEach((k) => localStorage.removeItem(k));
}

export function getCacheAge(key: string): number | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<unknown> = JSON.parse(raw);
    return Date.now() - entry.timestamp;
  } catch {
    return null;
  }
}
