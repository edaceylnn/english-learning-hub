import { useMemo, useState } from 'react';
import { Grid3x3, Keyboard, ListChecks, PenLine, Sparkles, Star, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QuizGame } from '../components/games/QuizGame';
import { TypingGame } from '../components/games/TypingGame';
import { MatchingGame } from '../components/games/MatchingGame';
import { ClozeGame } from '../components/games/ClozeGame';

type GameMode = 'quiz' | 'typing' | 'matching' | 'cloze';

const modes: {
  id: GameMode;
  label: string;
  description: string;
  icon: typeof ListChecks;
}[] = [
  {
    id: 'quiz',
    label: 'Çoktan Seçmeli',
    description: 'Anlamı hızlı yakala',
    icon: ListChecks,
  },
  {
    id: 'typing',
    label: 'Yazma',
    description: 'İngilizcesini hatırla',
    icon: Keyboard,
  },
  {
    id: 'matching',
    label: 'Eşleştirme',
    description: 'Kartları bağla',
    icon: Grid3x3,
  },
  {
    id: 'cloze',
    label: 'Boşluk Doldurma',
    description: 'Cümleyi tamamla',
    icon: PenLine,
  },
];

export function GamePage() {
  const { words } = useApp();
  const [mode, setMode] = useState<GameMode>('quiz');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const gameWords = useMemo(
    () => (favoritesOnly ? words.filter((w) => w.favorite) : words),
    [words, favoritesOnly],
  );

  return (
    <div className="relative z-10">
      <div className="relative mb-6 overflow-hidden rounded-lg border border-indigo-100/80 bg-white/[0.86] p-6 text-slate-950 shadow-[0_24px_70px_rgba(79,70,229,0.12)] backdrop-blur dark:border-slate-950/10 dark:bg-slate-950 dark:text-white dark:shadow-[0_24px_70px_rgba(15,23,42,0.2)] sm:p-7">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-300 via-indigo-400 to-cyan-300" />
        <div className="absolute right-0 top-0 h-full w-2/5 bg-[linear-gradient(135deg,rgba(245,158,11,0.10),rgba(99,102,241,0.10)_48%,rgba(20,184,166,0.08))] dark:bg-[linear-gradient(135deg,rgba(99,102,241,0.18),rgba(20,184,166,0.12)_45%,rgba(245,158,11,0.12))]" />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-white/10 dark:bg-white/[0.08] dark:text-amber-100">
              <Trophy size={13} /> Practice arena
            </span>
            <h1 className="mt-4 text-4xl font-black leading-none">Oyun</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-white/64">
              Kelimeler en az çalışılandan başlayarak döner. Her mod pratik geçmişini günceller, ama kelimeleri eski tekrar tarihleriyle kilitlemez.
            </p>
          </div>
          <div className="relative grid grid-cols-2 gap-2 sm:min-w-64">
            <div className="rounded-lg border border-indigo-100/90 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.08]">
              <p className="text-2xl font-black">{gameWords.length}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-white/45">
                aktif kelime
              </p>
            </div>
            <div className="rounded-lg border border-indigo-100/90 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.08]">
              <p className="text-2xl font-black">{modes.length}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-white/45">
                oyun modu
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {modes.map(({ id, label, description, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`group flex min-h-24 items-start gap-3 rounded-lg border p-4 text-left shadow-[0_16px_38px_rgba(15,23,42,0.07)] transition-all duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                mode === id
                  ? 'border-indigo-200/80 bg-indigo-500/[0.10] text-slate-950 shadow-[0_18px_42px_rgba(79,70,229,0.12)] dark:border-indigo-300/20 dark:bg-indigo-500/[0.16] dark:text-white dark:shadow-none'
                  : 'border-border bg-surface/90 text-foreground hover:border-primary/30 hover:bg-surface'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  mode === id
                    ? 'bg-primary text-white dark:bg-white/12 dark:text-indigo-200'
                    : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                }`}
              >
                <Icon size={18} />
              </span>
              <span>
                <span className="block text-sm font-bold">{label}</span>
                <span
                  className={`mt-1 block text-xs ${
                    mode === id ? 'text-slate-600 dark:text-white/62' : 'text-muted'
                  }`}
                >
                  {description}
                </span>
              </span>
            </button>
          ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface/88 p-3 shadow-sm backdrop-blur">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles size={16} className="text-amber-500" />
          Pratik havuzu: {favoritesOnly ? 'favoriler' : 'tüm kelimeler'}
        </span>
        <button
          onClick={() => setFavoritesOnly((v) => !v)}
          aria-pressed={favoritesOnly}
          className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-semibold transition-all duration-150 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
            favoritesOnly
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-border bg-surface text-muted hover:bg-surface-hover hover:text-foreground'
          }`}
        >
          <Star size={15} fill={favoritesOnly ? 'currentColor' : 'none'} />
          Sadece favoriler
        </button>
      </div>

      {mode === 'quiz' && (
        <QuizGame words={gameWords} favoritesOnly={favoritesOnly} />
      )}
      {mode === 'typing' && (
        <TypingGame words={gameWords} favoritesOnly={favoritesOnly} />
      )}
      {mode === 'matching' && (
        <MatchingGame words={gameWords} favoritesOnly={favoritesOnly} />
      )}
      {mode === 'cloze' && (
        <ClozeGame words={gameWords} favoritesOnly={favoritesOnly} />
      )}
    </div>
  );
}
