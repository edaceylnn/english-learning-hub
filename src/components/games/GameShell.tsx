import type { ReactNode } from 'react';
import { Heart, RotateCcw, Zap } from 'lucide-react';
import { Button } from '../ui';

export function GameCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-[760px] rounded-[20px] border border-border bg-surface p-6 shadow-sm sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}

export function GameStatusBar({
  lives,
  maxLives,
  current,
  total,
  score,
}: {
  lives: number;
  maxLives: number;
  current: number;
  total: number;
  score: number;
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-1">
        {Array.from({ length: maxLives }).map((_, i) => (
          <Heart
            key={i}
            size={14}
            className={i < lives ? 'text-red-500' : 'text-muted/25'}
            fill={i < lives ? 'currentColor' : 'none'}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-muted">
        Soru {current} / {total}
      </span>
      <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
        <Zap size={13} fill="currentColor" /> {score} XP
      </span>
    </div>
  );
}

export function GameProgress({
  current,
  total,
  className = '',
}: {
  current: number;
  total: number;
  className?: string;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return (
    <div className={`mt-7 ${className}`}>
      <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-muted/70">
        <span>İlerleme</span>
        <span>%{pct}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function FinishedCard({
  title = 'Oyun bitti',
  value,
  valueLabel,
  detail,
  onRestart,
}: {
  title?: string;
  value: ReactNode;
  valueLabel: string;
  detail?: string;
  onRestart: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[440px] rounded-[20px] border border-border bg-surface p-8 text-center shadow-sm sm:p-10">
      <p className="text-sm font-medium text-muted">{title}</p>
      <p className="mt-3 text-5xl font-bold text-primary">{value}</p>
      <p className="text-sm text-muted">{valueLabel}</p>
      {detail && <p className="mt-4 text-sm text-muted">{detail}</p>}
      <Button className="mx-auto mt-6" onClick={onRestart}>
        <RotateCcw size={16} /> Tekrar Oyna
      </Button>
    </div>
  );
}
