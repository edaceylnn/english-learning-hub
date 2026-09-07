import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, Card, PageHeader } from '../components/ui';
import { todoPriorityTone } from '../lib/labels';

const weekDays = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

export function CalendarPage() {
  const { lessonNotes, todos, words, notes } = useApp();
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  function eventsForDay(day: Date) {
    const lessons = lessonNotes.filter((l) => isSameDay(new Date(l.date), day));
    const dueTodos = todos.filter(
      (t) => t.dueDate && isSameDay(new Date(t.dueDate), day),
    );
    const reviews = words.filter((w) => isSameDay(new Date(w.nextReviewAt), day));
    const dayNotes = notes.filter((n) => isSameDay(new Date(n.createdAt), day));
    return { lessons, dueTodos, reviews, dayNotes };
  }

  const selectedEvents = eventsForDay(selected);

  return (
    <div>
      <PageHeader title="Takvim" subtitle="Ders, not, görev ve tekrarlarını gör" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-base font-semibold capitalize text-slate-900 dark:text-slate-50">
              {format(month, 'MMMM yyyy', { locale: tr })}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setMonth((m) => subMonths(m, 1))}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setMonth((m) => addMonths(m, 1))}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400">
            {weekDays.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const { lessons, dueTodos, reviews, dayNotes } = eventsForDay(day);
              const total = lessons.length + dueTodos.length + dayNotes.length;
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelected(day)}
                  className={`flex h-20 flex-col items-start rounded-lg border p-1.5 text-left text-xs transition-colors ${
                    isSameDay(day, selected)
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                  } ${!isSameMonth(day, month) ? 'opacity-40' : ''}`}
                >
                  <span
                    className={`mb-1 flex h-5 w-5 items-center justify-center rounded-full ${
                      isToday(day)
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  <div className="flex flex-wrap gap-0.5">
                    {total > 0 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    )}
                    {reviews.length > 0 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    )}
                  </div>
                  {total > 0 && (
                    <span className="mt-auto text-[10px] text-slate-400">
                      {total} kayıt
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <p className="mb-3 font-semibold text-slate-900 dark:text-slate-50">
            {format(selected, 'd MMMM yyyy, EEEE', { locale: tr })}
          </p>

          {selectedEvents.reviews.length === 0 &&
          selectedEvents.lessons.length === 0 &&
          selectedEvents.dueTodos.length === 0 &&
          selectedEvents.dayNotes.length === 0 ? (
            <p className="text-sm text-slate-400">Bu gün için kayıt yok.</p>
          ) : (
            <div className="space-y-4">
              {selectedEvents.reviews.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-slate-400">
                    Tekrar ({selectedEvents.reviews.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEvents.reviews.map((w) => (
                      <Badge key={w.id} tone="amber">
                        {w.term}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedEvents.lessons.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-slate-400">
                    Ders Notları
                  </p>
                  <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                    {selectedEvents.lessons.map((l) => (
                      <li key={l.id}>{l.topic}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedEvents.dueTodos.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-slate-400">
                    Görevler
                  </p>
                  <ul className="space-y-1">
                    {selectedEvents.dueTodos.map((t) => (
                      <li key={t.id} className="flex items-center gap-2 text-sm">
                        <Badge tone={todoPriorityTone[t.priority]}>•</Badge>
                        {t.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedEvents.dayNotes.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-slate-400">
                    Notlar
                  </p>
                  <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                    {selectedEvents.dayNotes.map((n) => (
                      <li key={n.id}>{n.title}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
