import { Link } from 'react-router-dom';
import { isSameDay } from 'date-fns';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ListChecks,
  NotebookPen,
  Repeat,
  StickyNote,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, Button, Card, PageHeader } from '../components/ui';
import { formatDate, wordStatusTone } from '../lib/labels';

export function DashboardPage() {
  const { words, notes, lessonNotes, todos, settings } = useApp();

  const dueWords = words.filter(
    (w) => new Date(w.nextReviewAt).getTime() <= Date.now(),
  );
  const openTodos = todos.filter((t) => t.status !== 'done');
  const todayTodos = todos.filter(
    (t) => t.dueDate && isSameDay(new Date(t.dueDate), new Date()),
  );
  const learned = words.filter((w) => w.status === 'learned').length;
  const latestLesson = lessonNotes[0];

  return (
    <div>
      <PageHeader
        title={`Merhaba${settings.displayName ? `, ${settings.displayName}` : ''} 👋`}
        subtitle="İngilizce çalışma özetin burada"
      />

      {dueWords.length > 0 && (
        <Card className="mb-5 flex items-center justify-between gap-3 border-indigo-200 bg-indigo-50 dark:border-indigo-500/30 dark:bg-indigo-500/10">
          <div>
            <p className="font-semibold text-indigo-900 dark:text-indigo-200">
              Bugün tekrar etmen gereken {dueWords.length} kelime var
            </p>
            <p className="text-sm text-indigo-600/80 dark:text-indigo-300/70">
              Hafızanı tazelemek için birkaç dakikanı ayır.
            </p>
          </div>
          <Link to="/review">
            <Button>
              Tekrara Başla <ArrowRight size={16} />
            </Button>
          </Link>
        </Card>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard icon={BookOpen} label="Toplam Kelime" value={words.length} to="/words" />
        <SummaryCard icon={Repeat} label="Öğrenilen Kelime" value={learned} to="/stats" />
        <SummaryCard icon={StickyNote} label="Not" value={notes.length} to="/notes" />
        <SummaryCard icon={ListChecks} label="Açık Görev" value={openTodos.length} to="/todos" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-slate-900 dark:text-zinc-50">
              Bugünün Görevleri
            </p>
            <Link to="/todos" className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              Tümünü gör
            </Link>
          </div>
          {todayTodos.length === 0 ? (
            <p className="text-sm text-slate-400">Bugün için görev bulunmuyor.</p>
          ) : (
            <ul className="space-y-2">
              {todayTodos.map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 dark:text-zinc-300">{t.title}</span>
                  <Badge>{t.priority}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-slate-900 dark:text-zinc-50">
              Son Ders Notu
            </p>
            <Link to="/lessons" className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              <NotebookPen size={14} className="inline" /> Tümünü gör
            </Link>
          </div>
          {!latestLesson ? (
            <p className="text-sm text-slate-400">Henüz ders notu eklenmedi.</p>
          ) : (
            <div>
              <p className="text-xs text-slate-400">{formatDate(latestLesson.date)}</p>
              <p className="font-medium text-slate-800 dark:text-zinc-200">
                {latestLesson.topic}
              </p>
              {latestLesson.learned && (
                <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                  {latestLesson.learned}
                </p>
              )}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-semibold text-slate-900 dark:text-zinc-50">
            Son Eklenen Kelimeler
          </p>
          <Link to="/words" className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
            Tümünü gör
          </Link>
        </div>
        {words.length === 0 ? (
          <p className="text-sm text-slate-400">Henüz kelime eklenmedi.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {words.slice(0, 10).map((w) => (
              <Badge key={w.id} tone={wordStatusTone[w.status]}>
                {w.term}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      <div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-400">
        <CalendarDays size={16} />
        <Link to="/calendar" className="font-medium text-indigo-600 dark:text-indigo-400">
          Takvimi aç
        </Link>
        <span>ve tüm çalışma planını gör.</span>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  to,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number;
  to: string;
}) {
  return (
    <Link to={to}>
      <Card className="transition-shadow hover:shadow-md">
        <Icon size={18} className="mb-2 text-indigo-500" />
        <p className="text-xl font-semibold text-slate-900 dark:text-zinc-50">
          {value}
        </p>
        <p className="text-xs text-slate-500 dark:text-zinc-400">{label}</p>
      </Card>
    </Link>
  );
}
