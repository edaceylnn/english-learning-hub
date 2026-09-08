import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SectionHeader({
  title,
  to,
  actionLabel = 'Tümünü Gör',
}: {
  title: string;
  to?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
      {to && (
        <Link
          to={to}
          className="inline-flex shrink-0 items-center gap-1 rounded-md text-xs font-medium text-primary transition-colors duration-150 hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          {actionLabel} <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}

export function DashboardCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-slate-200/90 bg-white/[0.94] p-5 shadow-[0_22px_55px_rgba(15,23,42,0.10)] backdrop-blur sm:p-6 dark:border-white/10 dark:bg-zinc-900/[0.88] dark:shadow-black/25 ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  helper,
  to,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  helper?: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-lg border border-slate-200/90 bg-white/[0.95] p-5 shadow-[0_22px_55px_rgba(15,23,42,0.10)] backdrop-blur transition-all duration-150 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_26px_65px_rgba(79,70,229,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:border-white/10 dark:bg-zinc-900/[0.88] dark:shadow-black/25"
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        <Icon size={18} />
      </div>
      <p className="text-[28px] font-semibold leading-none text-foreground">
        {value}
      </p>
      <p className="mt-2 text-[13px] text-muted">{label}</p>
      {helper && <p className="mt-1.5 text-xs text-muted/70">{helper}</p>}
    </Link>
  );
}

export function VocabularyChip({
  term,
  accent = false,
}: {
  term: string;
  accent?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150 ${
        accent
          ? 'border-primary/30 bg-primary/10 text-primary'
          : 'border-border bg-surface-hover text-foreground/80 hover:border-primary/30 hover:bg-primary/5 hover:text-primary'
      }`}
    >
      {term}
    </span>
  );
}

export function PrimaryButton({
  children,
  to,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled,
  className = '',
}: {
  children: ReactNode;
  to?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}) {
  const classes = `inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[10px] px-5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 ${
    variant === 'primary'
      ? 'bg-primary text-white shadow-[0_12px_30px_rgba(79,70,229,0.22)] hover:-translate-y-px hover:bg-primary-hover dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-100'
      : 'border border-border bg-surface/90 text-foreground shadow-sm hover:-translate-y-px hover:bg-surface-hover'
  } ${className}`;
  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
