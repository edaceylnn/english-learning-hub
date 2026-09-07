import { useMemo, useRef, useState } from 'react';
import { Heart, RotateCcw, Zap } from 'lucide-react';
import { START_LIVES, useGameRound } from '../../lib/useGameRound';
import { Button, Card, EmptyState, Input } from '../ui';
import type { Word } from '../../types';

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsTerm(word: Word): boolean {
  if (!word.example.trim()) return false;
  return new RegExp(`\\b${escapeRegExp(word.term)}\\b`, 'i').test(word.example);
}

function buildCloze(word: Word): string {
  return word.example.replace(
    new RegExp(`\\b${escapeRegExp(word.term)}\\b`, 'i'),
    '_____',
  );
}

export function ClozeGame({ words }: { words: Word[] }) {
  const clozeWords = useMemo(() => words.filter(containsTerm), [words]);

  const {
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
  } = useGameRound(clozeWords);

  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (feedback !== 'idle' || !current || !value.trim()) return;
    const correct = normalize(value) === normalize(current.term);
    submitAnswer(correct, () => {
      setValue('');
      inputRef.current?.focus();
    });
  }

  function handleRestart() {
    setValue('');
    restart();
  }

  if (clozeWords.length < 3) {
    return (
      <EmptyState
        title="Boşluk doldurma için en az 3 örnek cümleli kelime gerekiyor"
        description='Kelimeler sayfasında kelimenin örnek cümlesine kelimeyi geçirerek ekle (ör. "Smartphones have become ubiquitous").'
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
        <Button className="mx-auto mt-5" onClick={handleRestart}>
          <RotateCcw size={16} /> Tekrar Oyna
        </Button>
      </Card>
    );
  }

  if (!current) return null;

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-1">
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

      <Card className="mb-4 flex min-h-[120px] flex-col items-center justify-center gap-2 text-center">
        <p className="text-xs text-slate-400">Cümledeki boşluğu doldur</p>
        <p className="text-xl font-medium text-slate-800 dark:text-slate-100">
          "{buildCloze(current)}"
        </p>
        <p className="text-sm text-slate-400">{current.translation}</p>
      </Card>

      <form onSubmit={submit} className="space-y-2">
        <Input
          ref={inputRef}
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={feedback !== 'idle'}
          placeholder="Eksik kelimeyi yaz..."
          className={
            feedback === 'correct'
              ? 'border-emerald-500 ring-1 ring-emerald-500'
              : feedback === 'wrong'
                ? 'border-red-500 ring-1 ring-red-500'
                : ''
          }
        />
        {feedback === 'wrong' && (
          <p className="text-sm text-red-500">
            Doğrusu: <span className="font-semibold">{current.term}</span>
          </p>
        )}
        <Button type="submit" className="w-full" disabled={feedback !== 'idle'}>
          Kontrol Et
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-400">Skor: {score}</p>
    </div>
  );
}
