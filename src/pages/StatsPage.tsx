import { useMemo } from 'react';
import { format, isSameDay, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Flame, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, PageHeader } from '../components/ui';
import { wordTypeLabels } from '../lib/labels';
import { computeStreak } from '../lib/stats';
import { achievements } from '../lib/achievements';
import type { WordType } from '../types';

export function StatsPage() {
  const { words, notes, lessonNotes, reviewLog } = useApp();

  const unlockedIds = useMemo(() => {
    const ctx = { words, notes, lessonNotes, reviewLog };
    return new Set(achievements.filter((a) => a.isUnlocked(ctx)).map((a) => a.id));
  }, [words, notes, lessonNotes, reviewLog]);

  const totals = useMemo(() => {
    const learned = words.filter((w) => w.status === 'learned').length;
    const learning = words.filter((w) => w.status === 'learning').length;
    const fresh = words.filter((w) => w.status === 'new').length;
    return { total: words.length, learned, learning, fresh };
  }, [words]);

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
  }, []);

  const weeklyAdditions = useMemo(
    () =>
      last7Days.map((day) => ({
        day,
        count: words.filter((w) => isSameDay(new Date(w.createdAt), day)).length,
      })),
    [last7Days, words],
  );

  const weeklyReviews = useMemo(
    () =>
      last7Days.map((day) => ({
        day,
        count: reviewLog.filter((r) => isSameDay(new Date(r.reviewedAt), day))
          .length,
      })),
    [last7Days, reviewLog],
  );

  const streak = useMemo(() => computeStreak(reviewLog), [reviewLog]);

  const typeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    words.forEach((w) => {
      counts[w.type] = (counts[w.type] ?? 0) + 1;
    });
    return counts;
  }, [words]);

  const maxAddition = Math.max(1, ...weeklyAdditions.map((d) => d.count));
  const maxReview = Math.max(1, ...weeklyReviews.map((d) => d.count));
  const maxType = Math.max(1, ...Object.values(typeDistribution));

  return (
    <div>
      <PageHeader title="İstatistikler" subtitle="Çalışma ilerlemene genel bakış" />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Toplam Kelime" value={totals.total} />
        <StatCard label="Öğrenildi" value={totals.learned} tone="text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Öğrenilmekte" value={totals.learning} tone="text-amber-600 dark:text-amber-400" />
        <StatCard label="Yeni" value={totals.fresh} tone="text-slate-500" />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <p className="mb-4 font-semibold text-slate-900 dark:text-slate-50">
            Haftalık Eklenen Kelimeler
          </p>
          <div className="flex h-32 items-end justify-between gap-2">
            {weeklyAdditions.map(({ day, count }) => (
              <div key={day.toISOString()} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-indigo-500"
                  style={{ height: `${(count / maxAddition) * 100}%`, minHeight: count ? 4 : 0 }}
                />
                <span className="text-[10px] text-slate-400">
                  {format(day, 'EEEEEE', { locale: tr })}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-4 font-semibold text-slate-900 dark:text-slate-50">
            Haftalık Tekrar Sayısı
          </p>
          <div className="flex h-32 items-end justify-between gap-2">
            {weeklyReviews.map(({ day, count }) => (
              <div key={day.toISOString()} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-emerald-500"
                  style={{ height: `${(count / maxReview) * 100}%`, minHeight: count ? 4 : 0 }}
                />
                <span className="text-[10px] text-slate-400">
                  {format(day, 'EEEEEE', { locale: tr })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
            <Flame size={26} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              {streak} gün
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Günlük çalışma serisi
            </p>
          </div>
        </Card>

        <Card>
          <p className="mb-3 font-semibold text-slate-900 dark:text-slate-50">
            Tür Dağılımı
          </p>
          <div className="space-y-2">
            {Object.entries(typeDistribution).map(([type, count]) => (
              <div key={type} className="flex items-center gap-2">
                <span className="w-24 shrink-0 text-xs text-slate-500 dark:text-slate-400">
                  {wordTypeLabels[type as WordType]}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${(count / maxType) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs text-slate-400">
                  {count}
                </span>
              </div>
            ))}
            {Object.keys(typeDistribution).length === 0 && (
              <p className="text-sm text-slate-400">Henüz kelime eklenmedi.</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-5">
        <p className="mb-1 font-semibold text-slate-900 dark:text-slate-50">
          Başarımlar
        </p>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          {unlockedIds.size} / {achievements.length} tamamlandı
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {achievements.map((a) => {
            const unlocked = unlockedIds.has(a.id);
            const Icon = a.icon;
            return (
              <div
                key={a.id}
                className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center ${
                  unlocked
                    ? 'border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10'
                    : 'border-slate-200 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-slate-800/50'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    unlocked
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                      : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                  }`}
                >
                  {unlocked ? <Icon size={18} /> : <Lock size={16} />}
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {a.label}
                </p>
                <p className="text-[11px] text-slate-400">{a.description}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = 'text-slate-900 dark:text-slate-50',
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <Card>
      <p className={`text-2xl font-semibold ${tone}`}>{value}</p>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </Card>
  );
}
