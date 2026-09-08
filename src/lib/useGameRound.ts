import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { GAME_ROUND_SIZE, pickGamePool } from './gameWords';
import type { Word } from '../types';

export const START_LIVES = 3;
const TRANSITION_DELAY = 900;

export type Feedback = 'idle' | 'correct' | 'wrong';

/**
 * Shared scoring/lives/streak state machine for single-answer game modes
 * (Yazma, Boşluk Doldurma). Each answer is logged for stats and fair future
 * rotation, without changing the word's spaced-repetition schedule.
 */
export function useGameRound(words: Word[]) {
  const { logWordPractice, reviewLog } = useApp();
  const [seed, setSeed] = useState(0);

  const pool = useMemo(
    () => pickGamePool(words, GAME_ROUND_SIZE, reviewLog),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [words.length, seed],
  );

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(START_LIVES);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>('idle');
  const [finished, setFinished] = useState(false);

  const current = pool[index];

  function restart() {
    setSeed((s) => s + 1);
    setIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setLives(START_LIVES);
    setAnsweredCount(0);
    setFeedback('idle');
    setFinished(false);
  }

  function submitAnswer(correct: boolean, onAdvance?: () => void) {
    if (feedback !== 'idle' || !current) return;
    setFeedback(correct ? 'correct' : 'wrong');

    const newStreak = correct ? streak + 1 : 0;
    const newLives = correct ? lives : lives - 1;

    logWordPractice(current.id, correct ? (streak >= 2 ? 'easy' : 'good') : 'again');
    setStreak(newStreak);
    setBestStreak((b) => Math.max(b, newStreak));
    setLives(newLives);
    setAnsweredCount((c) => c + 1);
    if (correct) setScore((s) => s + 10 + streak * 2);

    setTimeout(() => {
      const noLives = newLives <= 0;
      const noMore = index + 1 >= pool.length;
      if (noLives || noMore) {
        setFinished(true);
      } else {
        setIndex((i) => i + 1);
        setFeedback('idle');
        onAdvance?.();
      }
    }, TRANSITION_DELAY);
  }

  return {
    pool,
    current,
    index,
    score,
    streak,
    bestStreak,
    lives,
    answeredCount,
    feedback,
    finished,
    restart,
    submitAnswer,
  };
}
