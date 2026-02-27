/** force first character to lowercase — ensures no sentence or header starts capitalized */
export function lc(text: string): string {
  if (!text) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}
