import { useMemo, useState } from "react";
import type { Binding } from "../types";
import { detectConflicts, type ConflictGroup } from "../utils/conflictDetection";

interface UseConflictsReturn {
  conflicts: ConflictGroup[];
  conflictCount: number;
  showConflicts: boolean;
  toggleConflicts: () => void;
}

export function useConflicts(bindings: Binding[]): UseConflictsReturn {
  const [showConflicts, setShowConflicts] = useState(false);

  const conflicts = useMemo(() => detectConflicts(bindings), [bindings]);

  return {
    conflicts,
    conflictCount: conflicts.length,
    showConflicts,
    toggleConflicts: () => setShowConflicts((s) => !s),
  };
}
