export type GameMode = "study" | "classic" | "survival" | "speedRound" | "dailyChallenge";

export interface ScoreResult {
  points: number;
  streakMultiplier: number;
  timeBonus: number;
}

export function calculateScore(streak: number, secondsTaken: number): ScoreResult {
  const base = 100;
  const timeBonus = Math.max(0, Math.floor(50 - secondsTaken * 10));
  const streakMultiplier = 1 + streak * 0.1;
  const points = Math.floor((base + timeBonus) * streakMultiplier);
  return { points, streakMultiplier, timeBonus };
}

export function getStreakMessage(streak: number): string | null {
  if (streak >= 20) return "// god mode";
  if (streak >= 15) return "// sudo mode";
  if (streak >= 10) return "// flow state";
  if (streak >= 5) return "// locked in";
  if (streak >= 3) return "// initializing...";
  return null;
}

export function generateDailySeed(date: string): number {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = (hash << 5) - hash + date.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Seeded shuffle for daily challenge — deterministic given the same date
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
