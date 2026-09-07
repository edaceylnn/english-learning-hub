import type { ReviewAnswer, Word, WordStatus } from '../types';

interface ScheduleResult {
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReviewAt: string;
  status: WordStatus;
}

/**
 * Simplified SM-2 style scheduler driven by the four review buttons.
 */
export function scheduleNextReview(
  word: Pick<Word, 'interval' | 'repetitions' | 'easeFactor'>,
  answer: ReviewAnswer,
): ScheduleResult {
  let { interval, repetitions, easeFactor } = word;

  switch (answer) {
    case 'again':
      repetitions = 0;
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      break;
    case 'hard':
      repetitions += 1;
      interval = Math.max(1, Math.round(interval * 1.2));
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      break;
    case 'good':
      repetitions += 1;
      interval = repetitions <= 1 ? 2 : Math.round(interval * easeFactor);
      break;
    case 'easy':
      repetitions += 1;
      interval =
        repetitions <= 1 ? 4 : Math.round(interval * easeFactor * 1.3);
      easeFactor += 0.15;
      break;
  }

  const next = new Date();
  next.setDate(next.getDate() + interval);

  const status: WordStatus =
    answer === 'again'
      ? 'learning'
      : repetitions >= 5
        ? 'learned'
        : 'learning';

  return {
    interval,
    repetitions,
    easeFactor,
    nextReviewAt: next.toISOString(),
    status,
  };
}

export function createInitialSchedule() {
  return {
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewAt: new Date().toISOString(),
  };
}

export function isDue(word: Word, at: Date = new Date()): boolean {
  return new Date(word.nextReviewAt).getTime() <= at.getTime();
}
