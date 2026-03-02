// Types
export type { AppId, Binding, AppConfig, CacheEntry, MatchInfo, SearchResult } from "./types.ts";

// Constants
export { APPS, APP_LIST } from "./constants.ts";

// Themes
export { THEMES } from "./themes.ts";
export type { Theme } from "./themes.ts";

// Utils
export { lc } from "./utils/text.ts";

export { highlightFromMatches } from "./utils/highlightMatches.ts";
export type { TextChunk } from "./utils/highlightMatches.ts";

export { normalizeKey, detectConflicts } from "./utils/conflictDetection.ts";
export type { ConflictGroup } from "./utils/conflictDetection.ts";

// Data
export { getDefaultBindings } from "./data/defaults.ts";

// Parsers
export { parsers, makeId, resetIdCounter } from "./parsers/index.ts";
export type { Parser } from "./parsers/index.ts";

// Hooks
export { useSearch } from "./hooks/useSearch.ts";
export type { BindingFilter } from "./hooks/useSearch.ts";
export { useTheme } from "./hooks/useTheme.ts";
export { useConflicts } from "./hooks/useConflicts.ts";
export { usePractice } from "./hooks/usePractice.ts";

// Components
export { Header } from "./components/Header.tsx";
export { SearchBar } from "./components/SearchBar.tsx";
export { FilterBar } from "./components/FilterBar.tsx";
export { AppSection } from "./components/AppSection.tsx";
export { BindingCard } from "./components/BindingCard.tsx";
export { KbdBadge } from "./components/KbdBadge.tsx";
export { ThemePicker } from "./components/ThemePicker.tsx";
export { RefreshButton } from "./components/RefreshButton.tsx";
export { LoadingState } from "./components/LoadingState.tsx";
export { ConflictPanel } from "./components/ConflictPanel.tsx";

export { ExportButton } from "./components/ExportButton.tsx";
export { PracticeMode } from "./components/PracticeMode.tsx";
export { ShareButton } from "./components/ShareButton.tsx";
export { encodeBindings, decodeBindings, getShareHash, buildShareUrl } from "./utils/shareUrl.ts";
export { exportToPng, exportToPdf } from "./utils/exportUtils.ts";
