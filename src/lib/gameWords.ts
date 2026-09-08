import type { ReviewLogEntry, Word } from '../types';

/** Default number of questions per game round, regardless of vocabulary size. */
export const GAME_ROUND_SIZE = 12;

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function latestPracticeTimes(reviewLog: ReviewLogEntry[]): Map<string, number> {
  const latest = new Map<string, number>();
  for (const entry of reviewLog) {
    if (latest.has(entry.wordId)) continue;
    latest.set(entry.wordId, new Date(entry.reviewedAt).getTime());
  }
  return latest;
}

/** Builds fair game rounds by prioritizing words practiced least recently. */
export function pickGamePool(
  words: Word[],
  limit?: number,
  reviewLog: ReviewLogEntry[] = [],
): Word[] {
  const latest = latestPracticeTimes(reviewLog);
  const shuffled = shuffle(words);
  const sorted = shuffled.sort(
    (a, b) => (latest.get(a.id) ?? 0) - (latest.get(b.id) ?? 0),
  );
  return limit ? sorted.slice(0, limit) : sorted;
}

export function formatSeconds(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function normalizeText(value: string): string {
  return value
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/\s+/g, ' ');
}

export function getTranslationMeanings(translation: string): string[] {
  const meanings = translation
    .replace(/\(([^)]*)\)/g, ',$1,')
    .split(/\s*(?:[,;/|]|\n|\r|\bveya\b|\bya da\b)\s*/iu)
    .map((part) =>
      normalizeText(part)
        .replace(/^[\s"'“”‘’]+|[\s"'“”‘’]+$/g, '')
        .replace(/[.!?]+$/g, ''),
    )
    .filter(Boolean);

  return Array.from(new Set(meanings));
}

export function translationsOverlap(a: string, b: string): boolean {
  const aMeanings = getTranslationMeanings(a);
  const bMeanings = getTranslationMeanings(b);
  if (aMeanings.length === 0 || bMeanings.length === 0) return false;
  return aMeanings.some((meaning) => bMeanings.includes(meaning));
}

/** Other words in the list that share at least one Turkish meaning with this word. */
export function findSynonyms(word: Word, words: Word[]): Word[] {
  return words.filter(
    (w) => w.id !== word.id && translationsOverlap(w.translation, word.translation),
  );
}

/** Empty-state copy that points at the favorites filter when it's the likely cause. */
export function emptyWordsHint(favoritesOnly: boolean, fallback: string): string {
  return favoritesOnly
    ? 'Favori kelimelerin sayısı yetersiz. Kelimeler sayfasından favori ekle ya da "Sadece favoriler" filtresini kapat.'
    : fallback;
}
