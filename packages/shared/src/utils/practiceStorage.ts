import type { GameMode } from "./practiceScoring";

export interface RunResult {
  score: number;
  date: string;
  accuracy: number;
  bestStreak: number;
  avgResponseMs: number;
  mode: Exclude<GameMode, "study">;
  scope: string;
}

export interface PracticeStore {
  highscores: {
    classic: RunResult | null;
    survival: RunResult | null;
    speedRound: RunResult | null;
  };
  recentRuns: RunResult[];
  dailyChallenges: Record<string, RunResult>;
  totalPracticed: number;
}

const STORAGE_KEY = "cheatsheet-practice-scores";

function defaultStore(): PracticeStore {
  return {
    highscores: { classic: null, survival: null, speedRound: null },
    recentRuns: [],
    dailyChallenges: {},
    totalPracticed: 0,
  };
}

export function loadScores(): PracticeStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStore();
    return { ...defaultStore(), ...JSON.parse(raw) };
  } catch {
    return defaultStore();
  }
}

export function saveRun(result: RunResult): PracticeStore {
  const store = loadScores();

  // Update highscore if applicable
  if (result.mode !== "dailyChallenge") {
    const key = result.mode as keyof PracticeStore["highscores"];
    const current = store.highscores[key];
    if (!current || result.score > current.score) {
      store.highscores[key] = result;
    }
  }

  // Store daily challenge result
  if (result.mode === "dailyChallenge") {
    store.dailyChallenges[result.date] = result;
  }

  // Add to recent runs (keep last 10)
  store.recentRuns = [result, ...store.recentRuns].slice(0, 10);

  // Update lifetime count
  store.totalPracticed += Math.round(result.accuracy / 100 * (result.score > 0 ? 1 : 0));

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage full or unavailable
  }

  return store;
}

export function getHighscore(mode: keyof PracticeStore["highscores"]): RunResult | null {
  return loadScores().highscores[mode];
}

export function getDailyResult(date: string): RunResult | null {
  return loadScores().dailyChallenges[date] ?? null;
}
