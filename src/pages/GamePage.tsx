import { useMemo, useState } from 'react';
import { Grid3x3, Keyboard, ListChecks, PenLine, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QuizGame } from '../components/games/QuizGame';
import { TypingGame } from '../components/games/TypingGame';
import { MatchingGame } from '../components/games/MatchingGame';
import { ClozeGame } from '../components/games/ClozeGame';

type GameMode = 'quiz' | 'typing' | 'matching' | 'cloze';

const modes: { id: GameMode; label: string; icon: typeof ListChecks }[] = [
  { id: 'quiz', label: 'Çoktan Seçmeli', icon: ListChecks },
  { id: 'typing', label: 'Yazma', icon: Keyboard },
  { id: 'matching', label: 'Eşleştirme', icon: Grid3x3 },
  { id: 'cloze', label: 'Boşluk Doldurma', icon: PenLine },
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
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-foreground">Oyun</h1>
        <p className="mt-1 text-sm text-muted">
          Kelimelerini farklı oyunlarla tekrar et ve öğrendiklerini pekiştir.
        </p>
        <p className="mt-0.5 text-xs text-muted/60">
          Verdiğin cevaplar tekrar planına otomatik olarak eklenir.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="inline-flex flex-wrap gap-1 rounded-2xl border border-border bg-surface p-1">
          {modes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                mode === id
                  ? 'bg-primary text-white'
                  : 'text-muted hover:bg-surface-hover hover:text-foreground'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setFavoritesOnly((v) => !v)}
          aria-pressed={favoritesOnly}
          className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
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
