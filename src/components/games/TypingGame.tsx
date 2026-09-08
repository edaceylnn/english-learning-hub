import { useMemo, useRef, useState } from 'react';
import { emptyWordsHint, findSynonyms, normalizeText } from '../../lib/gameWords';
import { START_LIVES, useGameRound } from '../../lib/useGameRound';
import { Button, EmptyState, Input } from '../ui';
import { FinishedCard, GameCard, GameProgress, GameStatusBar } from './GameShell';
import type { Word } from '../../types';

export function TypingGame({
  words,
  favoritesOnly = false,
}: {
  words: Word[];
  favoritesOnly?: boolean;
}) {
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
  } = useGameRound(words);

  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Other words that mean the same thing (identical translation) are also
  // accepted, so a genuine synonym isn't marked wrong just because a
  // different word happened to be drawn for this round.
  const acceptedTerms = useMemo(() => {
    if (!current) return [];
    return [current, ...findSynonyms(current, words)].map((w) => w.term);
  }, [current, words]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (feedback !== 'idle' || !current || !value.trim()) return;
    const correct = acceptedTerms.some((term) => normalizeText(term) === normalizeText(value));
    submitAnswer(correct, () => {
      setValue('');
      inputRef.current?.focus();
    });
  }

  function handleRestart() {
    setValue('');
    restart();
  }

  if (words.length < 1) {
    return (
      <EmptyState
        title="Yazma modu için en az 1 kelime gerekiyor"
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
        <p className="text-xs font-medium text-muted">Bu anlamın İngilizcesini yaz</p>
        <p className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
          {current.translation}
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-2.5">
        <Input
          ref={inputRef}
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={feedback !== 'idle'}
          placeholder="İngilizce kelimeyi yaz..."
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
            Doğrusu: <span className="font-semibold">{acceptedTerms.join(' / ')}</span>
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
