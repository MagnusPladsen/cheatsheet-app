import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import type { Binding, AppId } from "../types";
import type { GameMode } from "../utils/practiceScoring";
import { APPS } from "../constants";
import { KbdBadge } from "./KbdBadge";
import { captureKeyCombo } from "../utils/keyCapture";
import { usePractice } from "../hooks/usePractice";

import { lc } from "../utils/text";
import { getDailyResult } from "../utils/practiceStorage";

interface PracticeModeProps {
  bindings: Binding[];
  onClose: () => void;
}

type Screen = "mode" | "scope" | "play" | "results";

const MODE_OPTIONS: { mode: GameMode; label: string; desc: string }[] = [
  { mode: "study", label: "study", desc: "answers shown, learn at your pace" },
  { mode: "classic", label: "classic", desc: "flash cards, no pressure" },
  { mode: "survival", label: "survival", desc: "3 lives, how far can you go?" },
  { mode: "speedRound", label: "speed round", desc: "30 seconds, max correct" },
  { mode: "dailyChallenge", label: "daily challenge", desc: "today's fixed set, one shot" },
];

// Filter out bindings that can't be practiced via keyboard capture
const VIM_RAW_PATTERN = /<(esc|cr|leader|c-|m-|a-|s-|bs|tab|space|bar|bslash|lt|gt|plug|sid|cmd|f\d)/i;
// Placeholder keys that describe ranges/directions rather than actual keys
const PLACEHOLDER_PATTERN = /\b(0-9|arrow|n\b)/i;

function isPracticable(b: Binding): boolean {
  if (!b.key || !b.action) return false;
  if (VIM_RAW_PATTERN.test(b.key)) return false;
  // Filter out bindings where the action is raw vim notation, not a description
  if (VIM_RAW_PATTERN.test(b.action) || /^<[^>]+>/.test(b.action)) return false;
  // Filter out disabled bindings
  if (b.action.startsWith("(disabled")) return false;
  // Zsh aliases are typed commands, not key combos
  if (b.app === "zsh" && !b.key.includes("+")) return false;
  // Filter out placeholder/range keys like "0-9", "Arrow", "N"
  if (PLACEHOLDER_PATTERN.test(b.key)) return false;
  // Vim commands starting with : can't be captured as keydown
  if (b.key.startsWith(":")) return false;
  return true;
}

export function PracticeMode({ bindings, onClose }: PracticeModeProps) {
  const [screen, setScreen] = useState<Screen>("mode");
  const [selectedMode, setSelectedMode] = useState<GameMode>("classic");
  const [inputDisplay, setInputDisplay] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [scorePopKey, setScorePopKey] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);
  const [streakFadeKey, setStreakFadeKey] = useState(0);

  const practice = usePractice();
  const {
    active, mode, current, steps, stepIndex, score, streak,
    total, lives, lastResult, lastPoints, streakMessage, finished,
    timeRemaining, questionIndex, cardTimings, runResult, store,
    isNewHighscore,
    start, check, skip, stop, tick,
  } = practice;

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pressedKeysRef = useRef(new Set<string>());
  const allReleasedRef = useRef(true);

  // Practicable bindings (filtered once)
  const practicable = useMemo(() => bindings.filter(isPracticable), [bindings]);

  // Group by app for scope selection
  const appGroups = useMemo(() => {
    const groups: { app: AppId; name: string; icon: string; color: string; count: number }[] = [];
    const seen = new Set<AppId>();
    for (const b of practicable) {
      if (!seen.has(b.app)) {
        seen.add(b.app);
        const appConfig = APPS[b.app];
        groups.push({
          app: b.app,
          name: appConfig.name,
          icon: appConfig.icon,
          color: appConfig.color,
          count: practicable.filter((x) => x.app === b.app).length,
        });
      }
    }
    return groups;
  }, [practicable]);

  // Group by category within practicable
  const practiceCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const b of practicable) {
      if (b.category) cats.add(b.category);
    }
    return [...cats].sort();
  }, [practicable]);

  // Track keyup for multi-step sequences — require all keys released between steps
  useEffect(() => {
    if (screen !== "play" || !active || finished) return;

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeysRef.current.delete(e.code);
      if (pressedKeysRef.current.size === 0) {
        allReleasedRef.current = true;
      }
    };

    const handleBlur = () => {
      pressedKeysRef.current.clear();
      allReleasedRef.current = true;
    };

    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [screen, active, finished]);

  // Speed round timer
  useEffect(() => {
    if (mode === "speedRound" && active && !finished) {
      timerRef.current = setInterval(tick, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [mode, active, finished, tick]);

  // Transition to results when finished
  useEffect(() => {
    if (finished && mode !== "study") {
      setScreen("results");
    }
  }, [finished, mode]);

  const beginPractice = useCallback(
    (selectedScope: string) => {
      let filtered: Binding[];
      if (selectedScope === "all") {
        filtered = practicable;
      } else if (selectedScope.startsWith("app:")) {
        const appId = selectedScope.slice(4) as AppId;
        filtered = practicable.filter((b) => b.app === appId);
      } else {
        filtered = practicable.filter((b) => b.category === selectedScope);
      }
      if (filtered.length === 0) return;
      start(filtered, selectedMode, selectedScope);
      setScreen("play");
    },
    [practicable, start, selectedMode],
  );

  const selectMode = useCallback((gameMode: GameMode) => {
    setSelectedMode(gameMode);
    setScreen("scope");
  }, []);

  const handleNewSession = useCallback(() => {
    stop();
    setScreen("mode");
    setInputDisplay("");
    setAttempts(0);
  }, [stop]);

  // Capture key combos
  useEffect(() => {
    if (screen !== "play" || !active || !current || finished) return;

    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Ignore held-key autorepeat
      if (e.repeat) return;

      // Track physically pressed keys
      pressedKeysRef.current.add(e.code);

      const combo = captureKeyCombo(e);
      if (!combo || combo === "Shift" || combo === "Ctrl" || combo === "Alt" || combo === "Cmd") {
        return;
      }

      // For multi-step sequences, require all keys released from previous step
      if (stepIndex > 0 && !allReleasedRef.current) {
        return;
      }
      allReleasedRef.current = false;

      setInputDisplay(combo);

      if (mode === "study") {
        const result = check(combo);
        if (result === "correct" || result === "partial") {
          setPulseKey((k) => k + 1);
        }
        // Study mode: no attempt tracking, no auto-skip
        return;
      }

      const result = check(combo);
      if (result === "correct") {
        setAttempts(0);
        setPulseKey((k) => k + 1);
        if (lastPoints > 0) setScorePopKey((k) => k + 1);
      } else if (result === "partial") {
        // Partial match — keep going
      } else if (result === "wrong") {
        setShakeKey((k) => k + 1);
        setAttempts((a) => {
          const next = a + 1;
          if (next >= 3 && mode !== "survival") {
            skip();
            return 0;
          }
          return next;
        });
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [screen, active, current, finished, check, skip, mode, lastPoints, stepIndex]);

  // Reset input display and key tracking on new question
  useEffect(() => {
    setInputDisplay("");
    setAttempts(0);
    pressedKeysRef.current.clear();
    allReleasedRef.current = true;
  }, [current?.id]);

  // Trigger streak message fade
  useEffect(() => {
    if (streakMessage) setStreakFadeKey((k) => k + 1);
  }, [streakMessage]);

  // -- MODE SELECTION SCREEN --
  if (screen === "mode") {
    const today = new Date().toISOString().slice(0, 10);
    const dailyDone = !!getDailyResult(today);

    return (
      <div className="fixed inset-0 z-50 bg-bg-primary/95 flex items-center justify-center">
        <div className="max-w-md w-full p-6 space-y-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-sm font-bold text-accent tracking-wider">{lc("// practice mode")}</h2>
              <span className="px-1.5 py-0.5 text-[9px] bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded tracking-wider">
                {lc("experimental")}
              </span>
            </div>
            <p className="text-xs text-text-muted">{lc("choose your challenge. some key combos may not register correctly.")}</p>
          </div>

          <div className="space-y-1">
            {MODE_OPTIONS.map(({ mode: m, label, desc }) => (
              <button
                key={m}
                onClick={() => selectMode(m)}
                className={`w-full text-left px-4 py-3 border transition-colors ${
                  m === "dailyChallenge" && dailyDone
                    ? "border-border/50 opacity-50 cursor-not-allowed"
                    : "border-border hover:border-accent/40 hover:bg-accent-dim"
                }`}
                disabled={m === "dailyChallenge" && dailyDone}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-primary">{lc(label)}</span>
                  {m === "dailyChallenge" && dailyDone && (
                    <span className="text-[11px] text-text-muted">{lc("completed")}</span>
                  )}
                </div>
                <p className="text-[11px] text-text-muted mt-0.5">{lc(desc)}</p>
              </button>
            ))}
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

  // -- SCOPE SELECTION SCREEN --
  if (screen === "scope") {
    return (
      <div className="fixed inset-0 z-50 bg-bg-primary/95 flex items-center justify-center">
        <div className="max-w-md w-full p-6 flex flex-col max-h-[90vh]">
          <div className="text-center space-y-2 shrink-0 pb-4">
            <h2 className="text-sm font-bold text-accent tracking-wider">{lc("// practice mode")}</h2>
            <p className="text-xs text-text-muted">{lc("choose what to practice")}</p>
          </div>

          <div className="space-y-1 overflow-y-auto flex-1 min-h-0 pr-1">
            {/* All bindings */}
            <button
              onClick={() => beginPractice("all")}
              className="w-full text-left px-4 py-3 border border-border hover:border-accent/40 hover:bg-accent-dim transition-colors"
            >
              <span className="text-xs text-text-primary">{lc("all bindings")}</span>
              <span className="text-xs text-text-muted ml-2">[{practicable.length}]</span>
            </button>

            {/* By app */}
            <div className="pt-2 pb-1">
              <p className="text-[11px] text-text-muted tracking-wider px-1">{lc("by app")}</p>
            </div>
            {appGroups.map(({ app, name, icon, color, count }) => (
              <button
                key={app}
                onClick={() => beginPractice(`app:${app}`)}
                className="w-full text-left px-4 py-3 border border-border hover:border-accent/40 hover:bg-accent-dim transition-colors"
              >
                <span className="text-xs">
                  <span className={color}>{icon}</span>
                  <span className="text-text-primary ml-1.5">{lc(name)}</span>
                </span>
                <span className="text-xs text-text-muted ml-2">[{count}]</span>
              </button>
            ))}

            {/* By category */}
            <div className="pt-2 pb-1">
              <p className="text-[11px] text-text-muted tracking-wider px-1">{lc("by category")}</p>
            </div>
            {practiceCategories.map((cat) => {
              const count = practicable.filter((b) => b.category === cat).length;
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

          <div className="shrink-0 pt-4">
            <button
              onClick={() => setScreen("mode")}
              className="w-full text-center text-xs text-text-muted hover:text-accent transition-colors tracking-wider py-2"
            >
              {lc("back")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -- RESULTS SCREEN --
  if (screen === "results" && runResult) {
    const slowest = [...cardTimings]
      .sort((a, b) => b.responseMs - a.responseMs)
      .slice(0, 3);

    const modeKey = runResult.mode === "dailyChallenge" ? null : runResult.mode as "classic" | "survival" | "speedRound";
    const highscore = modeKey ? store.highscores[modeKey] : null;

    return (
      <div className="fixed inset-0 z-50 bg-bg-primary/95 flex items-center justify-center">
        <div className="max-w-md w-full p-6 space-y-4">
          <h2 className="text-sm font-bold text-accent tracking-wider text-center">
            {lc("// session complete")}
          </h2>

          {mode === "survival" && lives <= 0 && (
            <p className="text-xs text-red-400 text-center">{lc("game over")}</p>
          )}
          {mode === "speedRound" && (
            <p className="text-xs text-text-muted text-center">{lc("time's up!")}</p>
          )}

          <div className="border border-border divide-y divide-border text-xs">
            <div className="flex justify-between px-4 py-2">
              <span className="text-text-muted">{lc("score")}</span>
              <span className="text-text-primary">
                {runResult.score.toLocaleString()}
                {isNewHighscore && <span className="text-accent ml-2">{lc("[new record!]")}</span>}
              </span>
            </div>
            <div className="flex justify-between px-4 py-2">
              <span className="text-text-muted">{lc("accuracy")}</span>
              <span className="text-text-primary">
                {runResult.accuracy}%
                {highscore && <span className="text-text-muted ml-2">({lc("best:")} {highscore.accuracy}%)</span>}
              </span>
            </div>
            <div className="flex justify-between px-4 py-2">
              <span className="text-text-muted">{lc("best streak")}</span>
              <span className="text-text-primary">
                {runResult.bestStreak}
                {highscore && <span className="text-text-muted ml-2">({lc("best:")} {highscore.bestStreak})</span>}
              </span>
            </div>
            <div className="flex justify-between px-4 py-2">
              <span className="text-text-muted">{lc("avg response")}</span>
              <span className="text-text-primary">
                {(runResult.avgResponseMs / 1000).toFixed(1)}s
                {highscore && <span className="text-text-muted ml-2">({lc("best:")} {(highscore.avgResponseMs / 1000).toFixed(1)}s)</span>}
              </span>
            </div>
          </div>

          {slowest.length > 0 && (
            <div className="space-y-1">
              <p className="text-[11px] text-text-muted tracking-wider">{lc("slowest:")}</p>
              {slowest.map((t, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-1.5 border border-border/50">
                  <span className="text-[11px] text-text-secondary truncate mr-2">
                    {lc(t.binding.action)}
                  </span>
                  <span className="text-[11px] text-text-muted shrink-0">
                    {(t.responseMs / 1000).toFixed(1)}s
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleNewSession}
              className="px-4 py-2 border border-border text-xs text-text-secondary hover:border-accent/40 hover:text-accent transition-colors tracking-wider"
            >
              {lc("new mode")}
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

  // -- ACTIVE PRACTICE --
  if (!current) return null;
  const app = APPS[current.app];

  return (
    <div className="fixed inset-0 z-50 bg-bg-primary/95 flex items-center justify-center">
      <div className="max-w-lg w-full p-6 space-y-6 relative">
        {/* Score pop animation */}
        {lastPoints > 0 && (
          <span
            key={scorePopKey}
            className="absolute top-2 right-6 text-xs text-accent font-bold practice-score-pop pointer-events-none"
          >
            +{lastPoints}
          </span>
        )}

        {/* Streak message overlay */}
        {streakMessage && (
          <span
            key={streakFadeKey}
            className="absolute top-10 left-1/2 -translate-x-1/2 text-xs text-accent/80 tracking-wider practice-streak-fade pointer-events-none"
          >
            {streakMessage}
          </span>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-accent tracking-wider">{lc("// practice")}</span>
            {mode !== "study" && (
              <span className="text-xs text-text-muted">{score.toLocaleString()}</span>
            )}
            {mode === "study" && (
              <span className="text-xs text-text-muted">{questionIndex}/{total}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {mode === "speedRound" && (
              <span className={`text-xs font-bold ${timeRemaining <= 5 ? "text-red-400" : "text-text-primary"}`}>
                {timeRemaining}s
              </span>
            )}
            {mode === "survival" && (
              <span className="text-xs">
                {Array.from({ length: 3 }, (_, i) => (
                  <span key={i} className={i < lives ? "text-red-400" : "text-text-muted/30"}>
                    {" \u2764"}
                  </span>
                ))}
              </span>
            )}
            {streak > 1 && mode !== "study" && (
              <span className={`text-xs ${
                streak >= 10 ? "text-accent practice-streak-glow" : "text-accent"
              }`}>
                {streak} {lc("streak")}
              </span>
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
            style={{ width: `${(questionIndex / total) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-2">
            <span className={`text-sm ${app.color}`}>{app.icon}</span>
            <span className="text-xs text-text-muted">{lc(app.name)}</span>
            {current.mode && (
              <span className="text-[11px] px-1 py-0.5 text-text-muted border border-border">
                {lc(current.mode)}
              </span>
            )}
          </div>

          <p className="text-lg text-text-primary font-medium">
            {lc(current.action)}
          </p>

          {/* Study mode: show the answer */}
          {mode === "study" && (
            <div className="pt-2">
              <p className="text-[11px] text-text-muted mb-1">{lc("answer:")}</p>
              <KbdBadge keys={current.key} />
            </div>
          )}

          {/* Multi-step progress */}
          {steps.length > 1 && (
            <div className="flex items-center justify-center gap-1.5">
              {steps.map((step, i) => (
                <span
                  key={i}
                  className={`text-[11px] px-1.5 py-0.5 border ${
                    i < stepIndex
                      ? "border-accent/30 text-accent/50 bg-accent-dim"
                      : i === stepIndex
                        ? "border-accent/60 text-accent cursor-blink"
                        : "border-border text-text-muted"
                  }`}
                >
                  {i < stepIndex ? step : i === stepIndex ? step : "?"}
                </span>
              ))}
              <span className="text-[11px] text-text-muted ml-1">
                [{stepIndex + 1}/{steps.length}]
              </span>
            </div>
          )}

          <p className="text-xs text-text-muted">
            {mode === "study" ? lc("press the combo to continue") : lc("press the key combo")}
          </p>
        </div>

        {/* Input display */}
        <div className="text-center space-y-3">
          <div
            key={lastResult === "correct" ? pulseKey : lastResult === "wrong" ? shakeKey : 0}
            className={`inline-flex items-center gap-2 px-4 py-3 border min-w-[8rem] justify-center ${
              lastResult === "correct"
                ? "border-green-400/50 bg-green-400/10 practice-correct-pulse"
                : lastResult === "wrong" && mode !== "study"
                  ? "border-red-400/50 bg-red-400/10 practice-wrong-shake"
                  : lastResult === "partial"
                    ? "border-accent/50 bg-accent-dim"
                    : "border-border"
            }`}
          >
            {inputDisplay ? (
              <KbdBadge keys={inputDisplay} />
            ) : (
              <span className="text-xs text-text-muted cursor-blink">_</span>
            )}
          </div>

          {lastResult === "wrong" && mode !== "survival" && mode !== "study" && (
            <p className="text-xs text-red-400">
              {lc("try again")} ({3 - attempts} {lc("left")})
            </p>
          )}
          {lastResult === "wrong" && mode === "survival" && (
            <p className="text-xs text-red-400">
              {lc("wrong!")} {lives > 0 ? `${lives} ${lc("lives left")}` : lc("game over")}
            </p>
          )}
          {lastResult === "partial" && (
            <p className="text-xs text-accent">
              {lc("next step...")}
            </p>
          )}
        </div>

        {/* Skip / Next button */}
        {mode === "study" ? (
          <div className="text-center">
            <button
              onClick={() => { skip(); }}
              className="text-xs text-text-muted hover:text-accent transition-colors tracking-wider"
            >
              {lc("next")} →
            </button>
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={() => { setAttempts(0); skip(); }}
              className="text-xs text-text-muted hover:text-accent transition-colors tracking-wider"
            >
              {lc("skip")} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
