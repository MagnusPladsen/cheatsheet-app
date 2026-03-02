import type Fuse from "fuse.js";

export interface TextChunk {
  text: string;
  highlight: boolean;
}

export function highlightFromMatches(
  text: string,
  matchIndices: readonly Fuse.RangeTuple[] | undefined,
): TextChunk[] {
  if (!matchIndices || matchIndices.length === 0) {
    return [{ text, highlight: false }];
  }

  const chunks: TextChunk[] = [];
  let lastIndex = 0;

  const sorted = [...matchIndices].sort((a, b) => a[0] - b[0]);

  for (const [start, end] of sorted) {
    if (start > lastIndex) {
      chunks.push({ text: text.slice(lastIndex, start), highlight: false });
    }
    chunks.push({ text: text.slice(start, end + 1), highlight: true });
    lastIndex = end + 1;
  }

  if (lastIndex < text.length) {
    chunks.push({ text: text.slice(lastIndex), highlight: false });
  }

  return chunks;
}
