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
  Sparkles,
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
  const todayPractice = reviewLog.filter((r) =>
    isSameDay(new Date(r.reviewedAt), new Date()),
  ).length;

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
      <div className="relative z-10 mb-6 overflow-hidden rounded-lg border border-indigo-100/80 bg-white/[0.86] p-6 text-slate-950 shadow-[0_24px_70px_rgba(79,70,229,0.12)] backdrop-blur dark:border-slate-950/10 dark:bg-slate-950 dark:text-white dark:shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:p-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-400 via-cyan-300 to-amber-300" />
        <div className="absolute right-0 top-0 h-full w-2/5 bg-[linear-gradient(135deg,rgba(99,102,241,0.12),rgba(20,184,166,0.09)_45%,rgba(245,158,11,0.10))] dark:bg-[linear-gradient(135deg,rgba(99,102,241,0.25),rgba(20,184,166,0.16)_45%,rgba(245,158,11,0.18))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(99,102,241,0.08),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(20,184,166,0.08),transparent_28%)] dark:bg-none" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-white/10 dark:bg-white/[0.08] dark:text-cyan-100">
              <Sparkles size={13} /> English practice cockpit
            </span>
            <h1 className="mt-5 max-w-xl text-4xl font-black leading-[1.02] text-slate-950 dark:text-white sm:text-5xl">
              Merhaba{settings.displayName ? `, ${settings.displayName}` : ''}.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-slate-600 dark:text-white/66">
              Kelimelerini oyunlarla döndür, notlarını toparla ve günlük çalışma ritmini canlı tut.
            </p>
          </div>
          <div className="grid w-full grid-cols-3 gap-2 sm:max-w-md">
            <HeroMetric label="Kelime" value={words.length} />
            <HeroMetric label="Bugün" value={todayPractice} />
            <HeroMetric label="Seri" value={streak} />
          </div>
        </div>
      </div>

      <div className="relative z-10 mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted">
            {dateLabel}
          </p>
        </div>
        <div className="flex items-center gap-3">
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
        <div className="relative z-10 mb-8 overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-white via-indigo-50 to-cyan-50 p-6 shadow-[0_18px_50px_rgba(79,70,229,0.16)] dark:from-zinc-900 dark:via-indigo-950/30 dark:to-cyan-950/20">
          <div className="pointer-events-none absolute right-6 top-6 z-0 hidden h-24 w-24 rotate-6 rounded-[22px] border border-indigo-200/60 bg-white/70 shadow-sm sm:block dark:border-white/10 dark:bg-white/5" />
          <div className="pointer-events-none absolute right-12 top-14 z-0 hidden h-20 w-20 -rotate-12 rounded-[20px] border border-amber-200/70 bg-amber-100/70 shadow-sm sm:block dark:border-amber-400/20 dark:bg-amber-400/10" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-indigo-500/20 dark:bg-white dark:text-slate-950">
                <Gamepad2 size={20} />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
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
        <div className="relative z-10 mb-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface/88 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
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

      <div className="relative z-10 mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
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

      <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
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
          className="cursor-pointer rounded-lg border border-border/80 bg-surface/88 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:p-6"
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

      <DashboardCard className="relative z-10 mt-5">
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

      <div className="relative z-10 mt-5 flex flex-col gap-4 rounded-lg border border-border bg-surface/88 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-6">
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

function HeroMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-indigo-100/90 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.08]">
      <p className="text-2xl font-black leading-none text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-white/45">
        {label}
      </p>
    </div>
  );
}
