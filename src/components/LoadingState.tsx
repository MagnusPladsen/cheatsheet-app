import { lc } from "../utils/text";

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-24 gap-1">
      <span className="text-sm text-text-secondary">{lc("fetching from github")}</span>
      <span className="cursor-blink text-accent text-sm">█</span>
    </div>
  );
}
