import { useEffect, useMemo, useState } from 'react';
import { Timer as TimerIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  emptyWordsHint,
  formatSeconds,
  shuffle,
  translationsOverlap,
  pickGamePool,
} from '../../lib/gameWords';
import { EmptyState } from '../ui';
import { FinishedCard, GameCard } from './GameShell';
import type { Word } from '../../types';

const PAIR_COUNT = 6;

export function MatchingGame({
  words,
  favoritesOnly = false,
}: {
  words: Word[];
  favoritesOnly?: boolean;
}) {
  const { logWordPractice, reviewLog } = useApp();
  const [seed, setSeed] = useState(0);

  const pairs = useMemo(() => {
    const selected: Word[] = [];
    for (const word of pickGamePool(words, undefined, reviewLog)) {
      if (
        selected.some((item) =>
          translationsOverlap(item.translation, word.translation),
        )
      ) {
        continue;
      }
      selected.push(word);
      if (selected.length === PAIR_COUNT) break;
    }
    return selected;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words.length, seed]);

  const leftItems = useMemo(
    () => shuffle(pairs.map((w) => ({ id: w.id, label: w.term }))),
    [pairs],
  );
  const rightItems = useMemo(
    () => shuffle(pairs.map((w) => ({ id: w.id, label: w.translation }))),
    [pairs],
  );

  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const finished = pairs.length > 0 && matchedIds.size === pairs.length;

  useEffect(() => {
    if (!startedAt || finished) return;
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 500);
    return () => clearInterval(t);
  }, [startedAt, finished]);

  useEffect(() => {
    if (!selectedLeft || !selectedRight) return;
    const leftWord = pairs.find((word) => word.id === selectedLeft);
    const rightWord = pairs.find((word) => word.id === selectedRight);
    const correct =
      selectedLeft === selectedRight ||
      (!!leftWord &&
        !!rightWord &&
        translationsOverlap(leftWord.translation, rightWord.translation));

    if (correct) {
      logWordPractice(selectedLeft, 'good');
      setMatchedIds((prev) => new Set(prev).add(selectedLeft));
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      logWordPractice(selectedLeft, 'again');
      logWordPractice(selectedRight, 'again');
      setMistakes((m) => m + 1);
      setWrongPair([selectedLeft, selectedRight]);
      const t = setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setWrongPair(null);
      }, 600);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeft, selectedRight]);

  function restart() {
    setSeed((s) => s + 1);
    setMatchedIds(new Set());
    setSelectedLeft(null);
    setSelectedRight(null);
    setWrongPair(null);
    setMistakes(0);
    setElapsed(0);
    setStartedAt(null);
  }

  function selectLeft(id: string) {
    if (matchedIds.has(id) || wrongPair) return;
    if (!startedAt) setStartedAt(Date.now());
    setSelectedLeft(id);
  }

  function selectRight(id: string) {
    if (matchedIds.has(id) || wrongPair) return;
    if (!startedAt) setStartedAt(Date.now());
    setSelectedRight(id);
  }

  if (pairs.length < 3) {
    return (
      <EmptyState
        title="Eşleştirme için en az 3 farklı anlam gerekiyor"
        description={emptyWordsHint(
          favoritesOnly,
          'Aynı Türkçe anlama sahip kelimeler aynı turda ayrıştırılmadığı için birkaç farklı anlamlı kelime ekleyip tekrar dene.',
        )}
      />
    );
  }

  if (finished) {
    return (
      <FinishedCard
        title="Tamamlandı!"
        value={formatSeconds(elapsed)}
        valueLabel={`${mistakes} hata ile ${pairs.length} çift eşleştirildi`}
        onRestart={restart}
      />
    );
  }

  return (
    <GameCard>
      <div className="mb-6 flex items-center justify-between gap-3 text-xs font-medium text-muted">
        <span className="flex items-center gap-1.5">
          <TimerIcon size={14} /> {formatSeconds(elapsed)}
        </span>
        <span>
          {matchedIds.size} / {pairs.length} eşleşti
        </span>
        <span>{mistakes} hata</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {leftItems.map((item) => {
            const isMatched = matchedIds.has(item.id);
            const isSelected = selectedLeft === item.id;
            const isWrong = wrongPair?.[0] === item.id;
            return (
              <button
                key={item.id}
                onClick={() => selectLeft(item.id)}
                disabled={isMatched}
                className={`w-full rounded-xl border px-3.5 py-3 text-left text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                  isMatched
                    ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600/60 dark:text-emerald-300/50'
                    : isWrong
                      ? 'border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-300'
                      : isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-surface text-foreground hover:-translate-y-px hover:border-primary/40 hover:bg-primary/5'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {rightItems.map((item) => {
            const isMatched = matchedIds.has(item.id);
            const isSelected = selectedRight === item.id;
            const isWrong = wrongPair?.[1] === item.id;
            return (
              <button
                key={item.id}
                onClick={() => selectRight(item.id)}
                disabled={isMatched}
                className={`w-full rounded-xl border px-3.5 py-3 text-left text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                  isMatched
                    ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600/60 dark:text-emerald-300/50'
                    : isWrong
                      ? 'border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-300'
                      : isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-surface text-foreground hover:-translate-y-px hover:border-primary/40 hover:bg-primary/5'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </GameCard>
  );
}
