import { useState, useCallback, useRef } from "react";
import type { Binding } from "../types";
import type { GameMode } from "../utils/practiceScoring";
import { parseBindingSteps, normalizeStep } from "../utils/keyCapture";
import { calculateScore, getStreakMessage, generateDailySeed, seededShuffle } from "../utils/practiceScoring";
import { saveRun, getDailyResult, loadScores } from "../utils/practiceStorage";
import type { RunResult, PracticeStore } from "../utils/practiceStorage";

export type StepResult = "correct" | "wrong" | "partial" | "skipped" | null;

export interface CardTiming {
  binding: Binding;
  responseMs: number;
  correct: boolean;
}

export interface UsePracticeReturn {
  active: boolean;
  mode: GameMode | null;
  current: Binding | null;
  steps: string[];
  stepIndex: number;
  score: number;
  streak: number;
  bestStreak: number;
  total: number;
  correct: number;
  lives: number;
  lastResult: StepResult;
  lastPoints: number;
  streakMessage: string | null;
  finished: boolean;
  timeRemaining: number;
  questionIndex: number;
  cardTimings: CardTiming[];
  runResult: RunResult | null;
  store: PracticeStore;
  isNewHighscore: boolean;
  dailyAlreadyPlayed: boolean;
  start: (bindings: Binding[], mode: GameMode, scope: string) => void;
  check: (input: string) => StepResult;
  skip: () => void;
  stop: () => void;
  tick: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function usePractice(): UsePracticeReturn {
  const [active, setActive] = useState(false);
  const [mode, setMode] = useState<GameMode | null>(null);
  const [queue, setQueue] = useState<Binding[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [lives, setLives] = useState(3);
  const [lastResult, setLastResult] = useState<StepResult>(null);
  const [lastPoints, setLastPoints] = useState(0);
  const [streakMessage, setStreakMessage] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [steps, setSteps] = useState<string[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [cardTimings, setCardTimings] = useState<CardTiming[]>([]);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [store, setStore] = useState<PracticeStore>(loadScores);
  const [isNewHighscore, setIsNewHighscore] = useState(false);
  const [dailyAlreadyPlayed, setDailyAlreadyPlayed] = useState(false);
  const [scope, setScope] = useState("");

  const questionStartRef = useRef(Date.now());

  const current = active && index < queue.length ? queue[index] : null;
  const finished = active && (
    (index >= queue.length && queue.length > 0) ||
    (mode === "survival" && lives <= 0) ||
    (mode === "speedRound" && timeRemaining <= 0 && index > 0)
  );

  const questionIndex = index;

  const finishRun = useCallback((finalScore: number, finalCorrect: number, finalTotal: number, finalBestStreak: number, finalTimings: CardTiming[], gameMode: GameMode, runScope: string) => {
    if (gameMode === "study") return;

    const avgMs = finalTimings.length > 0
      ? finalTimings.reduce((sum, t) => sum + t.responseMs, 0) / finalTimings.length
      : 0;

    const result: RunResult = {
      score: finalScore,
      date: new Date().toISOString().slice(0, 10),
      accuracy: finalTotal > 0 ? Math.round((finalCorrect / finalTotal) * 100) : 0,
      bestStreak: finalBestStreak,
      avgResponseMs: Math.round(avgMs),
      mode: gameMode as Exclude<GameMode, "study">,
      scope: runScope,
    };

    const updatedStore = saveRun(result);
    const modeKey = gameMode === "dailyChallenge" ? null : gameMode as keyof PracticeStore["highscores"];
    const isNew = modeKey ? updatedStore.highscores[modeKey]?.score === result.score : false;

    setRunResult(result);
    setStore(updatedStore);
    setIsNewHighscore(isNew);
  }, []);

  const start = useCallback((bindings: Binding[], gameMode: GameMode, selectedScope: string) => {
    const filtered = bindings.filter((b) => b.key && b.action);
    const today = new Date().toISOString().slice(0, 10);

    let prepared: Binding[];

    if (gameMode === "dailyChallenge") {
      const seed = generateDailySeed(today);
      prepared = seededShuffle(filtered, seed).slice(0, 20);
      const existing = getDailyResult(today);
      setDailyAlreadyPlayed(!!existing);
    } else {
      prepared = shuffle(filtered).slice(0, 20);
      setDailyAlreadyPlayed(false);
    }

    const firstSteps = prepared[0] ? parseBindingSteps(prepared[0].key) : [];

    setQueue(prepared);
    setIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrect(0);
    setTotal(prepared.length);
    setLives(3);
    setLastResult(null);
    setLastPoints(0);
    setStreakMessage(null);
    setTimeRemaining(gameMode === "speedRound" ? 30 : 0);
    setSteps(firstSteps);
    setStepIndex(0);
    setCardTimings([]);
    setRunResult(null);
    setIsNewHighscore(false);
    setMode(gameMode);
    setScope(selectedScope);
    setStore(loadScores());
    setActive(true);
    questionStartRef.current = Date.now();
  }, []);

  const check = useCallback(
    (input: string): StepResult => {
      if (!current || finished) return null;

      const currentSteps = parseBindingSteps(current.key);
      const expectedStep = currentSteps[stepIndex];
      if (!expectedStep) return null;

      const inputNorm = normalizeStep(input);
      const expectedNorm = normalizeStep(expectedStep);

      if (inputNorm === expectedNorm) {
        if (stepIndex < currentSteps.length - 1) {
          setStepIndex((s) => s + 1);
          setLastResult("partial");
          return "partial";
        }

        // All steps matched — correct
        const newStreak = streak + 1;
        const newCorrect = correct + 1;
        const elapsed = (Date.now() - questionStartRef.current) / 1000;
        const newBest = Math.max(bestStreak, newStreak);

        let newScore = score;
        if (mode !== "study") {
          const { points } = calculateScore(streak, elapsed);
          newScore = score + points;
          setScore(newScore);
          setLastPoints(points);
        }

        setStreak(newStreak);
        setCorrect(newCorrect);
        setBestStreak(newBest);
        setLastResult("correct");

        const msg = getStreakMessage(newStreak);
        if (msg) setStreakMessage(msg);

        const timing: CardTiming = { binding: current, responseMs: Date.now() - questionStartRef.current, correct: true };
        const newTimings = [...cardTimings, timing];
        setCardTimings(newTimings);

        const nextIndex = index + 1;
        setIndex(nextIndex);
        setStepIndex(0);

        if (nextIndex < queue.length) {
          setSteps(parseBindingSteps(queue[nextIndex].key));
        }

        questionStartRef.current = Date.now();

        if (nextIndex >= queue.length) {
          finishRun(newScore, newCorrect, total, newBest, newTimings, mode!, scope);
        }

        return "correct";
      } else {
        setStreak(0);
        setLastResult("wrong");
        setStepIndex(0);

        if (mode === "survival") {
          const newLives = lives - 1;
          setLives(newLives);
          if (newLives <= 0) {
            const timing: CardTiming = { binding: current, responseMs: Date.now() - questionStartRef.current, correct: false };
            const newTimings = [...cardTimings, timing];
            setCardTimings(newTimings);
            finishRun(score, correct, total, bestStreak, newTimings, mode!, scope);
          }
        }

        return "wrong";
      }
    },
    [current, finished, stepIndex, streak, correct, score, bestStreak, mode, lives, index, queue, total, cardTimings, finishRun, scope],
  );

  const skip = useCallback(() => {
    if (!current) return;
    setStreak(0);
    setLastResult("skipped");
    setStepIndex(0);

    const timing: CardTiming = { binding: current, responseMs: Date.now() - questionStartRef.current, correct: false };
    const newTimings = [...cardTimings, timing];
    setCardTimings(newTimings);

    const nextIndex = index + 1;
    setIndex(nextIndex);

    if (nextIndex < queue.length) {
      setSteps(parseBindingSteps(queue[nextIndex].key));
    }

    questionStartRef.current = Date.now();

    if (nextIndex >= queue.length) {
      finishRun(score, correct, total, bestStreak, newTimings, mode!, scope);
    }
  }, [current, index, queue, cardTimings, score, correct, total, bestStreak, mode, finishRun, scope]);

  const stop = useCallback(() => {
    setActive(false);
    setQueue([]);
    setIndex(0);
    setLastResult(null);
    setMode(null);
    setSteps([]);
    setStepIndex(0);
  }, []);

  const tick = useCallback(() => {
    if (mode !== "speedRound") return;
    setTimeRemaining((t) => {
      const next = t - 1;
      if (next <= 0) {
        finishRun(score, correct, total, bestStreak, cardTimings, mode!, scope);
        return 0;
      }
      return next;
    });
  }, [mode, score, correct, total, bestStreak, cardTimings, finishRun, scope]);

  return {
    active,
    mode,
    current,
    steps,
    stepIndex,
    score,
    streak,
    bestStreak,
    total,
    correct,
    lives,
    lastResult,
    lastPoints,
    streakMessage,
    finished,
    timeRemaining,
    questionIndex,
    cardTimings,
    runResult,
    store,
    isNewHighscore,
    dailyAlreadyPlayed,
    start,
    check,
    skip,
    stop,
    tick,
  };
}
