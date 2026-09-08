import { ChevronLeft, ChevronRight, Volume2, X } from 'lucide-react';
import { forwardRef, type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { isSpeechSupported, speak } from '../lib/speech';

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="relative z-10 mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-zinc-50">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-slate-200/80 bg-white/[0.88] p-5 shadow-[0_16px_45px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-zinc-900/[0.88] dark:shadow-black/25 ${className}`}
    >
      {children}
    </div>
  );
}

export function SpeakButton({
  text,
  size = 15,
  className = '',
}: {
  text: string;
  size?: number;
  className?: string;
}) {
  if (!isSpeechSupported()) return null;
  return (
    <button
      type="button"
      title="Telaffuzu dinle"
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
      className={`shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400 ${className}`}
    >
      <Volume2 size={size} />
    </button>
  );
}

export function Badge({
  children,
  tone = 'slate',
}: {
  children: ReactNode;
  tone?: 'slate' | 'indigo' | 'green' | 'amber' | 'red';
}) {
  const tones: Record<string, string> = {
    slate:
      'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300',
    indigo:
      'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
    green:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    amber:
      'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  type?: 'button' | 'submit';
  className?: string;
  disabled?: boolean;
  title?: string;
}) {
  const variants: Record<string, string> = {
    primary:
      'bg-primary text-white shadow-sm shadow-indigo-500/20 hover:bg-primary-hover disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-100',
    secondary:
      'bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-white/10 dark:hover:bg-zinc-800',
    ghost:
      'text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-slate-800',
    danger: 'bg-red-600 text-white hover:bg-red-500',
  };
  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-150 hover:-translate-y-px disabled:cursor-not-allowed disabled:hover:translate-y-0 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className = '', ...rest }, ref) {
  return (
    <input
      ref={ref}
      {...rest}
      className={`w-full rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-100/40 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/[0.045] dark:text-zinc-100 dark:shadow-none dark:placeholder:text-zinc-500 ${className}`}
    />
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = '', ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      {...rest}
      className={`w-full rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-100/40 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/[0.045] dark:text-zinc-100 dark:shadow-none dark:placeholder:text-zinc-500 ${className}`}
    />
  );
});

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  const { className = '', children, ...rest } = props;
  return (
    <select
      {...rest}
      className={`w-full rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/[0.045] dark:text-zinc-100 ${className}`}
    >
      {children}
    </select>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm dark:bg-black/55">
      <div
        className={`max-h-[90vh] w-full ${wide ? 'max-w-2xl' : 'max-w-md'} overflow-y-auto rounded-[18px] border border-slate-200/80 bg-white/[0.96] p-6 shadow-[0_30px_90px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/[0.96] dark:shadow-[0_30px_100px_rgba(0,0,0,0.5)]`}
      >
        <div className="mb-5 flex items-center justify-between border-b border-slate-200/70 pb-4 dark:border-white/10">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-50">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:hover:bg-white/[0.07] dark:hover:text-zinc-100"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-16 text-center dark:border-zinc-700">
      <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
        {title}
      </p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-400">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function PaginationControls({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200/90 bg-white/[0.9] px-4 py-3 text-sm shadow-[0_14px_35px_rgba(15,23,42,0.07)] backdrop-blur dark:border-white/10 dark:bg-zinc-900/[0.88] dark:shadow-black/20">
      <p className="text-muted">
        {start}-{end} / {total} kayıt
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-45"
          title="Önceki sayfa"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="inline-flex h-9 min-w-16 items-center justify-center rounded-lg bg-primary/10 px-3 text-xs font-semibold text-primary">
          {page} / {pageCount}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
          disabled={page === pageCount}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-45"
          title="Sonraki sayfa"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      {description && (
        <p className="mb-4 text-sm text-slate-500 dark:text-zinc-400">
          {description}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Vazgeç
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Sil
        </Button>
      </div>
    </Modal>
  );
}
