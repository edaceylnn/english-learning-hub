import { useEffect, useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  emptyWordsHint,
  GAME_ROUND_SIZE,
  pickGamePool,
  shuffle,
  translationsOverlap,
} from '../../lib/gameWords';
import { EmptyState, SpeakButton } from '../ui';
import { FinishedCard, GameCard, GameProgress, GameStatusBar } from './GameShell';
import type { Word } from '../../types';

const OPTION_COUNT = 4;
const START_LIVES = 3;

export function QuizGame({
  words,
  favoritesOnly = false,
}: {
  words: Word[];
  favoritesOnly?: boolean;
}) {
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
  const [answeredId, setAnsweredId] = useState<string | null>(null);
  const [correctId, setCorrectId] = useState<string | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = pool[index];

  const options = useMemo(() => {
    if (!current) return [];
    const distractors: Word[] = [];
    for (const w of shuffle(words.filter((w) => w.id !== current.id))) {
      if (
        translationsOverlap(w.translation, current.translation) ||
        distractors.some((d) => translationsOverlap(w.translation, d.translation))
      ) {
        continue;
      }
      distractors.push(w);
      if (distractors.length === OPTION_COUNT - 1) break;
    }
    return shuffle([current, ...distractors]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, words.length]);

  function restart() {
    setSeed((s) => s + 1);
    setIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setLives(START_LIVES);
    setAnsweredId(null);
    setCorrectId(null);
    setAnsweredCount(0);
    setFinished(false);
  }

  function choose(option: Word) {
    if (answeredId || !current) return;
    const correct =
      option.id === current.id ||
      translationsOverlap(option.translation, current.translation);

    setAnsweredId(option.id);
    setCorrectId(current.id);

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
        setAnsweredId(null);
        setCorrectId(null);
      }
    }, 700);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName ?? '').toLowerCase();
      if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
      if (answeredId || !['1', '2', '3', '4'].includes(e.key)) return;
      const opt = options[Number(e.key) - 1];
      if (opt) choose(opt);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, answeredId]);

  if (words.length < 2) {
    return (
      <EmptyState
        title="Quiz için en az 2 kelime gerekiyor"
        description={emptyWordsHint(
          favoritesOnly,
          'Kelimeler sayfasından birkaç kelime ekleyip tekrar dene.',
        )}
      />
    );
  }

  if (finished) {
    return (
      <FinishedCard
        value={score}
        valueLabel="puan"
        detail={`En uzun seri: ${bestStreak} · ${answeredCount} / ${pool.length} soru`}
        onRestart={restart}
      />
    );
  }

  if (!current) return null;

  return (
    <GameCard>
      <GameStatusBar
        lives={lives}
        maxLives={START_LIVES}
        current={index + 1}
        total={pool.length}
        score={score}
      />

      <div className="text-center">
        <p className="text-xs font-medium text-muted">Bu kelimenin anlamı nedir?</p>
        <div className="mt-3 flex items-center justify-center gap-2.5">
          <p className="text-3xl font-bold text-foreground sm:text-4xl">
            {current.term}
          </p>
          <SpeakButton text={current.term} size={20} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((opt, i) => {
          const isAnswered = !!answeredId;
          const isCorrectOption = opt.id === correctId;
          const isChosenWrong = isAnswered && opt.id === answeredId && !isCorrectOption;
          const isDimmed = isAnswered && !isCorrectOption && !isChosenWrong;
          return (
            <button
              key={opt.id}
              onClick={() => choose(opt)}
              disabled={isAnswered}
              className={`flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-default ${
                isAnswered && isCorrectOption
                  ? 'border-emerald-500/60 bg-emerald-500/10'
                  : isChosenWrong
                    ? 'border-red-500/60 bg-red-500/10'
                    : `border-border bg-surface hover:-translate-y-px hover:border-primary/40 hover:bg-primary/5 ${
                        isDimmed ? 'opacity-50' : ''
                      }`
              }`}
            >
              <span className="text-sm font-medium text-muted">{i + 1}.</span>
              <span
                className={`flex-1 text-sm font-medium ${
                  isAnswered && isCorrectOption
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : isChosenWrong
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-foreground'
                }`}
              >
                {opt.translation}
              </span>
              {isAnswered && isCorrectOption && (
                <Check size={16} className="animate-pop-in shrink-0 text-emerald-500" />
              )}
              {isChosenWrong && (
                <X size={16} className="animate-pop-in shrink-0 text-red-500" />
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-5 text-center text-[11px] text-muted/60">
        Klavyeden 1-4 tuşlarıyla da cevaplayabilirsin
      </p>

      <GameProgress current={index + 1} total={pool.length} />
    </GameCard>
  );
}
