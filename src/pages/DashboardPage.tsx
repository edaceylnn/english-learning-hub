import { Link, useNavigate } from 'react-router-dom';
import { isSameDay } from 'date-fns';
import {
  ArrowRight,
  BookOpen,
  Check,
  Flame,
  Gamepad2,
  ListChecks,
  Plus,
  Repeat,
  StickyNote,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui';
import {
  DashboardCard,
  PrimaryButton,
  SectionHeader,
  StatCard,
  VocabularyChip,
} from '../components/dashboard';
import { formatDate, todoPriorityLabels, todoPriorityTone } from '../lib/labels';
import { isDue } from '../lib/spacedRepetition';
import { computeStreak } from '../lib/stats';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function DashboardPage() {
  const { words, notes, lessonNotes, todos, settings, reviewLog, cycleTodoStatus } =
    useApp();
  const navigate = useNavigate();

  const openTodos = todos.filter((t) => t.status !== 'done');
  const todayTodos = todos.filter(
    (t) => t.dueDate && isSameDay(new Date(t.dueDate), new Date()),
  );
  const learned = words.filter((w) => w.status === 'learned').length;
  const latestLesson = lessonNotes[0];

  const weekAgo = Date.now() - WEEK_MS;
  const wordsThisWeek = words.filter(
    (w) => new Date(w.createdAt).getTime() >= weekAgo,
  ).length;
  const notesThisWeek = notes.filter(
    (n) => new Date(n.createdAt).getTime() >= weekAgo,
  ).length;

  const streak = computeStreak(reviewLog);
  const dateLabel = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const initials = settings.displayName.trim()
    ? settings.displayName.trim().slice(0, 2).toUpperCase()
    : 'E';

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight text-foreground">
            Merhaba{settings.displayName ? `, ${settings.displayName}` : ''} 👋
          </h1>
          <p className="mt-1 text-sm text-muted">
            Bugün İngilizcene birkaç dakika ayırmaya hazır mısın?
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm capitalize text-muted sm:inline">
            {dateLabel}
          </span>
          {streak > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground">
              <Flame size={14} className="text-amber-500" /> {streak} gün
            </span>
          )}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {initials}
          </div>
        </div>
      </div>

      {words.length > 0 ? (
        <div className="relative mb-6 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-surface to-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Gamepad2 size={20} />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-foreground">
                  Oyun pratiği
                </p>
                <p className="mt-0.5 text-sm text-foreground/90">
                  {words.length} kelimeni oyunlarla tekrar edebilirsin
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  Quiz, yazma, boşluk doldurma ve eşleştirme modları hazır.
                </p>
              </div>
            </div>
            <PrimaryButton to="/game">
              Oyuna Başla <ArrowRight size={16} />
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Check size={20} />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-foreground">
                Henüz kelime yok
              </p>
              <p className="mt-0.5 text-sm text-muted">
                Oyunlara başlamak için birkaç kelime ekle.
              </p>
            </div>
          </div>
          <PrimaryButton to="/words" variant="secondary">
            Kelime Ekle <Plus size={16} />
          </PrimaryButton>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Toplam Kelime"
          value={words.length}
          to="/words"
          helper={wordsThisWeek > 0 ? `Bu hafta +${wordsThisWeek}` : undefined}
        />
        <StatCard
          icon={Repeat}
          label="Öğrenilen Kelime"
          value={learned}
          to="/stats"
        />
        <StatCard
          icon={StickyNote}
          label="Not"
          value={notes.length}
          to="/notes"
          helper={notesThisWeek > 0 ? `Bu hafta +${notesThisWeek}` : undefined}
        />
        <StatCard
          icon={ListChecks}
          label="Açık Görev"
          value={openTodos.length}
          to="/todos"
          helper={todayTodos.length > 0 ? `${todayTodos.length} bugün` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <DashboardCard>
          <SectionHeader title="Bugünün Görevleri" to="/todos" />
          {todayTodos.length === 0 ? (
            <p className="text-sm text-muted">Bugün için görev bulunmuyor.</p>
          ) : (
            <ul className="space-y-0.5">
              {todayTodos.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => cycleTodoStatus(t.id)}
                    className="flex w-full items-center gap-3 rounded-[10px] px-2 py-2 text-left transition-colors duration-150 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors duration-150 ${
                        t.status === 'done'
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      }`}
                    >
                      {t.status === 'done' && (
                        <Check size={11} strokeWidth={3} className="text-white" />
                      )}
                    </span>
                    <span
                      className={`flex-1 truncate text-sm ${
                        t.status === 'done'
                          ? 'text-muted line-through'
                          : 'text-foreground'
                      }`}
                    >
                      {t.title}
                    </span>
                    <Badge tone={todoPriorityTone[t.priority]}>
                      {todoPriorityLabels[t.priority]}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>

        <div
          role="link"
          tabIndex={0}
          onClick={() => navigate('/lessons')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') navigate('/lessons');
          }}
          className="cursor-pointer rounded-2xl border border-border bg-surface p-5 transition-colors duration-150 hover:border-primary/30 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:p-6"
        >
          <SectionHeader title="Son Ders Notu" to="/lessons" />
          {!latestLesson ? (
            <p className="text-sm text-muted">Henüz ders notu eklenmedi.</p>
          ) : (
            <div>
              <p className="text-xs text-muted">{formatDate(latestLesson.date)}</p>
              <p className="mt-1 font-medium text-foreground">
                {latestLesson.topic}
              </p>
              {latestLesson.learned && (
                <p className="mt-1 line-clamp-2 text-sm text-muted">
                  {latestLesson.learned}
                </p>
              )}
              {latestLesson.newWordIds.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {latestLesson.newWordIds.slice(0, 4).map((id) => {
                    const w = words.find((word) => word.id === id);
                    return w ? <VocabularyChip key={id} term={w.term} /> : null;
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <DashboardCard className="mt-5">
        <SectionHeader title="Son Eklenen Kelimeler" to="/words" />
        {words.length === 0 ? (
          <p className="text-sm text-muted">Henüz kelime eklenmedi.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {words.slice(0, 8).map((w) => (
              <VocabularyChip key={w.id} term={w.term} accent={isDue(w)} />
            ))}
            {words.length > 8 && (
              <span className="inline-flex items-center rounded-full border border-dashed border-border px-3 py-1 text-xs font-medium text-muted">
                +{words.length - 8} tane daha
              </span>
            )}
          </div>
        )}
      </DashboardCard>

      <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-[15px] font-semibold text-foreground">
            Yaklaşan Çalışma
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted/70">
            Bugün
          </p>
          {todayTodos.length === 0 ? (
            <p className="mt-1.5 text-sm text-muted">
              Bugün için planlanan bir şey yok.
            </p>
          ) : (
            <ul className="mt-1.5 space-y-1 text-sm text-foreground/90">
              {todayTodos.slice(0, 2).map((t) => (
                <li key={t.id}>• {t.title}</li>
              ))}
              {todayTodos.length > 2 && (
                <li className="text-muted">
                  +{todayTodos.length - 2} görev daha
                </li>
              )}
            </ul>
          )}
        </div>
        <Link
          to="/calendar"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[10px] border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          Takvimi Gör <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
