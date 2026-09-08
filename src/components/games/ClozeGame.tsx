import { useMemo, useRef, useState } from 'react';
import { emptyWordsHint } from '../../lib/gameWords';
import { START_LIVES, useGameRound } from '../../lib/useGameRound';
import { Button, EmptyState, Input } from '../ui';
import { FinishedCard, GameCard, GameProgress, GameStatusBar } from './GameShell';
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

export function ClozeGame({
  words,
  favoritesOnly = false,
}: {
  words: Word[];
  favoritesOnly?: boolean;
}) {
  const clozeWords = useMemo(() => words.filter(containsTerm), [words]);

  const {
    pool,
    current,
    index,
    score,
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
        description={emptyWordsHint(
          favoritesOnly,
          'Kelimeler sayfasında kelimenin örnek cümlesine kelimeyi geçirerek ekle (ör. "Smartphones have become ubiquitous").',
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
        onRestart={handleRestart}
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
        <p className="text-xs font-medium text-muted">Cümledeki boşluğu doldur</p>
        <p className="mt-3 text-xl font-semibold text-foreground sm:text-2xl">
          "{buildCloze(current)}"
        </p>
        <p className="mt-2 text-sm text-muted">{current.translation}</p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-2.5">
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

      <GameProgress current={index + 1} total={pool.length} />
    </GameCard>
  );
}
