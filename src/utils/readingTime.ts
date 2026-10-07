/** Estimated reading time in whole minutes (at least 1) for a markdown body. */
export function readingTime(body: string | undefined, wordsPerMinute = 200): number {
  const words = (body ?? '').replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}
