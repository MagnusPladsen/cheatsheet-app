import { useState, useCallback, useMemo } from "react";
import type { Binding } from "../types";

interface PracticeState {
  current: Binding | null;
  score: number;
  streak: number;
  total: number;
  lastResult: "correct" | "wrong" | "skipped" | null;
  finished: boolean;
}

interface UsePracticeReturn extends PracticeState {
  active: boolean;
  start: (bindings: Binding[]) => void;
  check: (input: string) => boolean;
  skip: () => void;
  stop: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalizeForMatch(key: string): string {
  return key
    .split(/,\s*/)[0]
    .split("+")
    .map((p) => {
      const k = p.trim().toLowerCase();
      const aliases: Record<string, string> = {
        command: "cmd", super: "cmd", meta: "cmd",
        control: "ctrl",
        option: "alt", opt: "alt",
        cr: "enter", return: "enter",
        escape: "esc",
        bs: "backspace",
      };
      return aliases[k] ?? k;
    })
    .sort()
    .join("+");
}

export function usePractice(): UsePracticeReturn {
  const [active, setActive] = useState(false);
  const [queue, setQueue] = useState<Binding[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);
  const [lastResult, setLastResult] = useState<PracticeState["lastResult"]>(null);

  const current = active && index < queue.length ? queue[index] : null;
  const finished = active && index >= queue.length && queue.length > 0;

  const start = useCallback((bindings: Binding[]) => {
    const filtered = bindings.filter((b) => b.key && b.action);
    const shuffled = shuffle(filtered).slice(0, 20); // Cap at 20 for a session
    setQueue(shuffled);
    setIndex(0);
    setScore(0);
    setStreak(0);
    setTotal(shuffled.length);
    setLastResult(null);
    setActive(true);
  }, []);

  const advance = useCallback(() => {
    setIndex((i) => i + 1);
    // Clear result after a short delay handled by component
  }, []);

  const check = useCallback(
    (input: string) => {
      if (!current) return false;
      const inputNorm = input
        .split("+")
        .map((p) => p.trim().toLowerCase())
        .sort()
        .join("+");
      const expectedNorm = normalizeForMatch(current.key);

      if (inputNorm === expectedNorm) {
        setScore((s) => s + 1);
        setStreak((s) => s + 1);
        setLastResult("correct");
        advance();
        return true;
      } else {
        setStreak(0);
        setLastResult("wrong");
        return false;
      }
    },
    [current, advance],
  );

  const skip = useCallback(() => {
    setStreak(0);
    setLastResult("skipped");
    advance();
  }, [advance]);

  const stop = useCallback(() => {
    setActive(false);
    setQueue([]);
    setIndex(0);
    setLastResult(null);
  }, []);

  return {
    active,
    current,
    score,
    streak,
    total,
    lastResult,
    finished,
    start,
    check,
    skip,
    stop,
  };
}
