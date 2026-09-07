import { useEffect, useMemo, useState } from 'react';
import { Heart, RotateCcw, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { pickGamePool, shuffle } from '../../lib/gameWords';
import { Button, Card, EmptyState, SpeakButton } from '../ui';
import type { Word } from '../../types';

const OPTION_COUNT = 4;
const START_LIVES = 3;

export function QuizGame({ words }: { words: Word[] }) {
  const { reviewWord } = useApp();
  const [seed, setSeed] = useState(0);

  const pool = useMemo(
    () => pickGamePool(words),
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
    const distractors = shuffle(
      words.filter((w) => w.id !== current.id),
    ).slice(0, OPTION_COUNT - 1);
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
    const correct = option.id === current.id;

    setAnsweredId(option.id);
    setCorrectId(current.id);

    const newStreak = correct ? streak + 1 : 0;
    const newLives = correct ? lives : lives - 1;

    reviewWord(current.id, correct ? (streak >= 2 ? 'easy' : 'good') : 'again');
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
        description="Kelimeler sayfasından birkaç kelime ekleyip tekrar dene."
      />
    );
  }

  if (finished) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Oyun bitti
        </p>
        <p className="mt-2 text-4xl font-bold text-indigo-600 dark:text-indigo-400">
          {score}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">puan</p>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          En uzun seri: {bestStreak} · {answeredCount} / {pool.length} soru
        </p>
        <Button className="mx-auto mt-5" onClick={restart}>
          <RotateCcw size={16} /> Tekrar Oyna
        </Button>
      </Card>
    );
  }

  if (!current) return null;

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          {Array.from({ length: START_LIVES }).map((_, i) => (
            <Heart
              key={i}
              size={16}
              className={i < lives ? 'text-red-500' : 'text-slate-300 dark:text-slate-700'}
              fill={i < lives ? 'currentColor' : 'none'}
            />
          ))}
        </div>
        <span className="font-medium text-slate-600 dark:text-slate-300">
          Soru {index + 1} / {pool.length}
        </span>
        <span className="flex items-center gap-1 font-semibold text-amber-500">
          <Zap size={15} fill="currentColor" /> {streak}
        </span>
      </div>

      <Card className="mb-4 flex min-h-[120px] flex-col items-center justify-center text-center">
        <p className="text-xs text-slate-400">Bu kelimenin anlamı nedir?</p>
        <div className="mt-2 flex items-center gap-2">
          <p className="text-3xl font-semibold text-slate-900 dark:text-slate-50">
            {current.term}
          </p>
          <SpeakButton text={current.term} size={20} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((opt, i) => {
          const isAnswered = !!answeredId;
          const isCorrectOption = opt.id === correctId;
          const isChosenWrong = isAnswered && opt.id === answeredId && !isCorrectOption;
          return (
            <button
              key={opt.id}
              onClick={() => choose(opt)}
              disabled={isAnswered}
              className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-colors ${
                isAnswered && isCorrectOption
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                  : isChosenWrong
                    ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
              }`}
            >
              <span className="mr-1.5 text-slate-400">{i + 1}.</span>
              {opt.translation}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-sm text-slate-400">Skor: {score}</p>
      <p className="mt-1 text-center text-xs text-slate-400">1-4: cevapla</p>
    </div>
  );
}
