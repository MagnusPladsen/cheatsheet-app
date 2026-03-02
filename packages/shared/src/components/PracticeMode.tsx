import { useEffect, useState, useCallback } from "react";
import type { Binding } from "../types";
import { APPS } from "../constants";
import { KbdBadge } from "./KbdBadge";
import { captureKeyCombo } from "../utils/keyCapture";
import { usePractice } from "../hooks/usePractice";
import { lc } from "../utils/text";

interface PracticeModeProps {
  bindings: Binding[];
  categories: string[];
  onClose: () => void;
}

export function PracticeMode({ bindings, categories, onClose }: PracticeModeProps) {
  const [scope, setScope] = useState<"all" | string | null>(null);
  const { active, current, score, streak, total, lastResult, finished, start, check, skip, stop } = usePractice();
  const [inputDisplay, setInputDisplay] = useState("");
  const [attempts, setAttempts] = useState(0);

  const beginPractice = useCallback(
    (selectedScope: "all" | string) => {
      const filtered =
        selectedScope === "all"
          ? bindings
          : bindings.filter((b) => b.category === selectedScope);
      if (filtered.length === 0) return;
      setScope(selectedScope);
      start(filtered);
    },
    [bindings, start],
  );

  // Capture key combos
  useEffect(() => {
    if (!active || !current || finished) return;

    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const combo = captureKeyCombo(e);
      if (!combo || combo === "Shift" || combo === "Ctrl" || combo === "Alt" || combo === "Cmd") {
        return; // Still holding modifier
      }

      setInputDisplay(combo);
      const isCorrect = check(combo);
      if (!isCorrect) {
        setAttempts((a) => a + 1);
        // After 3 wrong attempts, auto-skip
        if (attempts >= 2) {
          setAttempts(0);
          skip();
        }
      } else {
        setAttempts(0);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, current, finished, check, skip, attempts]);

  // Reset input display on new question
  useEffect(() => {
    setInputDisplay("");
    setAttempts(0);
  }, [current?.id]);

  // Scope selection screen
  if (scope === null) {
    return (
      <div className="fixed inset-0 z-50 bg-bg-primary/95 flex items-center justify-center">
        <div className="max-w-md w-full p-6 space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-sm font-bold text-accent tracking-wider">{lc("// practice mode")}</h2>
            <p className="text-xs text-text-muted">{lc("choose what to practice")}</p>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => beginPractice("all")}
              className="w-full text-left px-4 py-3 border border-border hover:border-accent/40 hover:bg-accent-dim transition-colors"
            >
              <span className="text-xs text-text-primary">{lc("all bindings")}</span>
              <span className="text-xs text-text-muted ml-2">[{bindings.length}]</span>
            </button>

            {categories.map((cat) => {
              const count = bindings.filter((b) => b.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => beginPractice(cat)}
                  className="w-full text-left px-4 py-3 border border-border hover:border-accent/40 hover:bg-accent-dim transition-colors"
                >
                  <span className="text-xs text-text-primary">{lc(cat)}</span>
                  <span className="text-xs text-text-muted ml-2">[{count}]</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={onClose}
            className="w-full text-center text-xs text-text-muted hover:text-accent transition-colors tracking-wider py-2"
          >
            {lc("cancel")}
          </button>
        </div>
      </div>
    );
  }

  // Finished screen
  if (finished) {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div className="fixed inset-0 z-50 bg-bg-primary/95 flex items-center justify-center">
        <div className="max-w-md w-full p-6 text-center space-y-4">
          <h2 className="text-sm font-bold text-accent tracking-wider">{lc("// session complete")}</h2>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-text-primary">{score}/{total}</p>
            <p className="text-xs text-text-muted">{pct}% {lc("accuracy")}</p>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => { setScope(null); stop(); }}
              className="px-4 py-2 border border-border text-xs text-text-secondary hover:border-accent/40 hover:text-accent transition-colors tracking-wider"
            >
              {lc("new session")}
            </button>
            <button
              onClick={() => { stop(); onClose(); }}
              className="px-4 py-2 border border-accent/30 text-xs text-accent hover:bg-accent-dim transition-colors tracking-wider"
            >
              {lc("done")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active practice
  if (!current) return null;
  const app = APPS[current.app];
  const questionNum = total - (total - score - (attempts > 0 ? 0 : 0)) + 1;

  return (
    <div className="fixed inset-0 z-50 bg-bg-primary/95 flex items-center justify-center">
      <div className="max-w-lg w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-accent tracking-wider">{lc("// practice")}</span>
            <span className="text-xs text-text-muted">{score}/{total}</span>
          </div>
          <div className="flex items-center gap-3">
            {streak > 1 && (
              <span className="text-xs text-accent">{streak} {lc("streak")}</span>
            )}
            <button
              onClick={() => { stop(); onClose(); }}
              className="text-xs text-text-muted hover:text-accent transition-colors"
            >
              {lc("quit")}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-px bg-border relative">
          <div
            className="h-px bg-accent transition-all duration-300"
            style={{ width: `${(score / total) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-2">
            <span className={`text-sm ${app.color}`}>{app.icon}</span>
            <span className="text-xs text-text-muted">{lc(app.name)}</span>
            {current.mode && (
              <span className="text-[10px] px-1 py-0.5 text-text-muted border border-border">
                {lc(current.mode)}
              </span>
            )}
          </div>

          <p className="text-lg text-text-primary font-medium">
            {lc(current.action)}
          </p>

          <p className="text-xs text-text-muted">{lc("press the key combo")}</p>
        </div>

        {/* Input display */}
        <div className="text-center space-y-3">
          <div className={`inline-flex items-center gap-2 px-4 py-3 border min-w-[8rem] justify-center ${
            lastResult === "correct"
              ? "border-green-400/50 bg-green-400/10"
              : lastResult === "wrong"
                ? "border-red-400/50 bg-red-400/10"
                : "border-border"
          }`}>
            {inputDisplay ? (
              <KbdBadge keys={inputDisplay} />
            ) : (
              <span className="text-xs text-text-muted cursor-blink">_</span>
            )}
          </div>

          {lastResult === "wrong" && (
            <p className="text-xs text-red-400">
              {lc("try again")} ({3 - attempts} {lc("left")})
            </p>
          )}
          {lastResult === "skipped" && (
            <p className="text-xs text-text-muted">
              {lc("answer:")} <KbdBadge keys={current.key} />
            </p>
          )}
        </div>

        {/* Skip button */}
        <div className="text-center">
          <button
            onClick={() => { setAttempts(0); skip(); }}
            className="text-xs text-text-muted hover:text-accent transition-colors tracking-wider"
          >
            {lc("skip")} →
          </button>
        </div>
      </div>
    </div>
  );
}
