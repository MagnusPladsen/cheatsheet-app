import type { ConflictGroup } from "../utils/conflictDetection";
import { APPS } from "../constants";
import { KbdBadge } from "./KbdBadge";
import { lc } from "../utils/text";

interface ConflictPanelProps {
  conflicts: ConflictGroup[];
}

export function ConflictPanel({ conflicts }: ConflictPanelProps) {
  if (conflicts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-text-muted tracking-wider">{lc("no conflicts detected")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-amber-400/70 tracking-wider">
        {lc(`// ${conflicts.length} overlapping key${conflicts.length === 1 ? "" : "s"} across apps`)}
      </p>
      <p className="text-[10px] text-text-muted leading-relaxed">
        {lc("note: same keybinding in different apps is usually not a real conflict — most tools have independent key scopes and don't interfere with each other.")}
      </p>
      {conflicts.map((group) => (
        <div
          key={group.normalizedKey}
          className="border border-amber-400/30 bg-amber-400/5 p-3 space-y-2"
        >
          <div className="flex items-center gap-2">
            <KbdBadge keys={group.normalizedKey} />
            <span className="text-xs text-amber-400/60">
              {group.bindings.length} {lc("bindings")}
            </span>
          </div>
          <div className="space-y-1 pl-2 border-l border-amber-400/20">
            {group.bindings.map((b) => {
              const app = APPS[b.app];
              return (
                <div key={b.id} className="flex items-center gap-2 text-xs">
                  <span className={app.color}>{app.icon}</span>
                  <span className="text-text-muted">{lc(app.name)}</span>
                  {b.mode && (
                    <span className="text-[10px] px-1 py-0.5 text-text-muted border border-border">
                      {lc(b.mode)}
                    </span>
                  )}
                  <span className="text-text-secondary truncate">{lc(b.action)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
