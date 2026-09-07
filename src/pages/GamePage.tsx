import { useMemo, useState } from 'react';
import { Grid3x3, Keyboard, ListChecks, PenLine } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, PageHeader, Select } from '../components/ui';
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
  const [tagFilter, setTagFilter] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    words.forEach((w) => w.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [words]);

  const filteredWords = useMemo(() => {
    return words
      .filter((w) => tagFilter === 'all' || w.tags.includes(tagFilter))
      .filter((w) => !favoritesOnly || w.favorite);
  }, [words, tagFilter, favoritesOnly]);

  return (
    <div>
      <PageHeader
        title="Oyun"
        subtitle="Kelimelerini oynayarak tekrar et — her cevap tekrar planına da işlenir"
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
      </Card>

      <div className="mb-6 flex flex-wrap gap-2">
        {modes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              mode === id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {mode === 'quiz' && <QuizGame key={`quiz-${tagFilter}-${favoritesOnly}`} words={filteredWords} />}
      {mode === 'typing' && <TypingGame key={`typing-${tagFilter}-${favoritesOnly}`} words={filteredWords} />}
      {mode === 'matching' && <MatchingGame key={`matching-${tagFilter}-${favoritesOnly}`} words={filteredWords} />}
      {mode === 'cloze' && <ClozeGame key={`cloze-${tagFilter}-${favoritesOnly}`} words={filteredWords} />}
    </div>
  );
}
