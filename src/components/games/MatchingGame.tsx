import { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Timer as TimerIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatSeconds, shuffle } from '../../lib/gameWords';
import { Button, Card, EmptyState } from '../ui';
import type { Word } from '../../types';

const PAIR_COUNT = 6;

export function MatchingGame({ words }: { words: Word[] }) {
  const { reviewWord } = useApp();
  const [seed, setSeed] = useState(0);

  const pairs = useMemo(() => {
    const count = Math.min(PAIR_COUNT, words.length);
    return shuffle(words).slice(0, count);
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
    if (selectedLeft === selectedRight) {
      reviewWord(selectedLeft, 'good');
      setMatchedIds((prev) => new Set(prev).add(selectedLeft));
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      reviewWord(selectedLeft, 'again');
      reviewWord(selectedRight, 'again');
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

  if (words.length < 3) {
    return (
      <EmptyState
        title="Eşleştirme için en az 3 kelime gerekiyor"
        description="Kelimeler sayfasından birkaç kelime ekleyip tekrar dene."
      />
    );
  }

  if (finished) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
          Tamamlandı!
        </p>
        <p className="mt-2 text-4xl font-bold text-indigo-600 dark:text-indigo-400">
          {formatSeconds(elapsed)}
        </p>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          {mistakes} hata ile {pairs.length} çift eşleştirildi
        </p>
        <Button className="mx-auto mt-5" onClick={restart}>
          <RotateCcw size={16} /> Tekrar Oyna
        </Button>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between text-sm text-slate-500 dark:text-zinc-400">
        <span className="flex items-center gap-1">
          <TimerIcon size={15} /> {formatSeconds(elapsed)}
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
                className={`w-full rounded-lg border-2 px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  isMatched
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-400 opacity-60 dark:border-emerald-500/20 dark:bg-emerald-500/5'
                    : isWrong
                      ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300'
                      : isSelected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200'
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
                className={`w-full rounded-lg border-2 px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  isMatched
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-400 opacity-60 dark:border-emerald-500/20 dark:bg-emerald-500/5'
                    : isWrong
                      ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300'
                      : isSelected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
