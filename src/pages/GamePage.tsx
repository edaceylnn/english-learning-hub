import { useState } from 'react';
import { Grid3x3, Keyboard, ListChecks, PenLine } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/ui';
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

  return (
    <div>
      <PageHeader
        title="Oyun"
        subtitle="Kelimelerini oynayarak tekrar et — her cevap tekrar planına da işlenir"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {modes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              mode === id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-slate-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {mode === 'quiz' && <QuizGame words={words} />}
      {mode === 'typing' && <TypingGame words={words} />}
      {mode === 'matching' && <MatchingGame words={words} />}
      {mode === 'cloze' && <ClozeGame words={words} />}
    </div>
  );
}
