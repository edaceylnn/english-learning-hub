import { useEffect, useMemo, useState } from 'react';
import { PartyPopper, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Select,
  SpeakButton,
} from '../components/ui';
import type { ReviewAnswer } from '../types';
import { wordTypeLabels } from '../lib/labels';

const answerButtons: {
  answer: ReviewAnswer;
  label: string;
  className: string;
}[] = [
  { answer: 'again', label: 'Bilmiyorum', className: 'bg-red-600 hover:bg-red-500 text-white' },
  { answer: 'hard', label: 'Zorlandım', className: 'bg-amber-500 hover:bg-amber-400 text-white' },
  { answer: 'good', label: 'Hatırladım', className: 'bg-emerald-600 hover:bg-emerald-500 text-white' },
  { answer: 'easy', label: 'Çok Kolay', className: 'bg-indigo-600 hover:bg-indigo-500 text-white' },
];

export function ReviewPage() {
  const { words, reviewWord } = useApp();
  const [flipped, setFlipped] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [includeNew, setIncludeNew] = useState(true);
  const [tagFilter, setTagFilter] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    words.forEach((w) => w.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [words]);

  const dueWords = useMemo(() => {
    const now = Date.now();
    return words
      .filter((w) => new Date(w.nextReviewAt).getTime() <= now)
      .filter((w) => includeNew || w.status !== 'new')
      .filter((w) => tagFilter === 'all' || w.tags.includes(tagFilter))
      .filter((w) => !favoritesOnly || w.favorite)
      .sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt));
  }, [words, includeNew, tagFilter, favoritesOnly]);

  const current = dueWords[0];

  function answer(a: ReviewAnswer) {
    if (!current) return;
    reviewWord(current.id, a);
    setSessionCount((c) => c + 1);
    setFlipped(false);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName ?? '').toLowerCase();
      if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
      if (!current) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setFlipped((f) => !f);
        return;
      }
      if (flipped && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const idx = Number(e.key) - 1;
        const target = answerButtons[idx];
        if (target) answer(target.answer);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, flipped]);

  return (
    <div>
      <PageHeader
        title="Kelime Tekrarı"
        subtitle={
          dueWords.length > 0
            ? `Bugün tekrar edilecek ${dueWords.length} kelime var`
            : 'Bugün için tekrar bulunmuyor'
        }
      />

      <Card className="mb-5 flex flex-wrap items-center gap-4">
        <Select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="max-w-[180px]"
        >
          <option value="all">Tüm etiketler</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </Select>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={favoritesOnly}
            onChange={(e) => setFavoritesOnly(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Sadece favoriler
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={includeNew}
            onChange={(e) => setIncludeNew(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Yeni kelimeleri dahil et
        </label>
      </Card>

      {!current ? (
        <EmptyState
          title={
            sessionCount > 0
              ? `Harika! Bu oturumda ${sessionCount} kelime tekrar ettin.`
              : 'Tekrar edilecek kelime yok'
          }
          description="Yeni kelimeler eklediğinde veya tekrar zamanı geldiğinde burada görünecekler."
          action={
            sessionCount > 0 ? (
              <PartyPopper className="text-amber-500" size={28} />
            ) : undefined
          }
        />
      ) : (
        <div className="mx-auto max-w-xl">
          <div className="mb-3 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>Sırada {dueWords.length} kelime var</span>
            <span>Bu oturumda: {sessionCount}</span>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => setFlipped((f) => !f)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setFlipped((f) => !f);
              }
            }}
            className="block w-full cursor-pointer text-left"
          >
            <Card className="flex min-h-[260px] flex-col items-center justify-center gap-4 text-center transition-transform hover:scale-[1.01]">
              {!flipped ? (
                <>
                  <Badge>{wordTypeLabels[current.type]}</Badge>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-semibold text-slate-900 dark:text-slate-50">
                      {current.term}
                    </p>
                    <SpeakButton text={current.term} size={20} />
                  </div>
                  {current.example && (
                    <p className="max-w-sm text-sm italic text-slate-400">
                      "{current.example}"
                    </p>
                  )}
                  <p className="mt-4 flex items-center gap-1 text-xs text-slate-400">
                    <RotateCcw size={12} /> Çevirmek için tıkla
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-400">{current.term}</p>
                  <p className="text-3xl font-semibold text-indigo-600 dark:text-indigo-400">
                    {current.translation}
                  </p>
                  {current.notes && (
                    <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
                      {current.notes}
                    </p>
                  )}
                </>
              )}
            </Card>
          </div>

          {flipped && (
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {answerButtons.map(({ answer: a, label, className }, i) => (
                <Button
                  key={a}
                  onClick={() => answer(a)}
                  className={className}
                >
                  <span className="opacity-60">{i + 1}</span> {label}
                </Button>
              ))}
            </div>
          )}

          <p className="mt-4 text-center text-xs text-slate-400">
            Boşluk: çevir · 1-4: cevapla
          </p>
        </div>
      )}
    </div>
  );
}
