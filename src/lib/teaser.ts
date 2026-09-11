/**
 * How much of a file to show before the paywall — a taste, never the substance.
 * Shared so the server truncation and the "N more lines" label can't disagree.
 */
export function teaserLineCount(totalLines: number): number {
  return Math.min(Math.max(Math.ceil(totalLines * 0.3), 6), 16)
}
