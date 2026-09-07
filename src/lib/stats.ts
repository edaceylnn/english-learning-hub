import { isSameDay, subDays } from 'date-fns';
import type { ReviewLogEntry } from '../types';

/** Consecutive days (including today) with at least one review, counted backwards. */
export function computeStreak(reviewLog: ReviewLogEntry[]): number {
  let count = 0;
  let cursor = new Date();
  while (reviewLog.some((r) => isSameDay(new Date(r.reviewedAt), cursor))) {
    count += 1;
    cursor = subDays(cursor, 1);
  }
  return count;
}
