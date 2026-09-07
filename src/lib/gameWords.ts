import type { Word } from '../types';

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Prefers words that are due for review; falls back to the full list. */
export function pickGamePool(words: Word[], limit?: number): Word[] {
  const due = words.filter((w) => new Date(w.nextReviewAt).getTime() <= Date.now());
  const base = due.length >= 2 ? due : words;
  const shuffled = shuffle(base);
  return limit ? shuffled.slice(0, limit) : shuffled;
}

export function formatSeconds(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
