import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  CalendarDays,
  Gamepad2,
  LayoutDashboard,
  ListChecks,
  Moon,
  NotebookPen,
  Repeat,
  Settings as SettingsIcon,
  StickyNote,
  Sun,
  BarChart3,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Study',
    items: [
      { to: '/', label: 'Panel', icon: LayoutDashboard, end: true },
      { to: '/words', label: 'Kelimeler', icon: BookOpen },
      { to: '/review', label: 'Kelime Tekrarı', icon: Repeat },
      { to: '/game', label: 'Oyun', icon: Gamepad2 },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { to: '/notes', label: 'Notlar', icon: StickyNote },
      { to: '/lessons', label: 'Ders Notları', icon: NotebookPen },
      { to: '/todos', label: 'Yapılacaklar', icon: ListChecks },
      { to: '/calendar', label: 'Takvim', icon: CalendarDays },
    ],
  },
  {
    label: 'Insights',
    items: [{ to: '/stats', label: 'İstatistikler', icon: BarChart3 }],
  },
];

const navLinkClasses =
  'group flex h-9 items-center justify-between gap-2 rounded-[10px] px-3 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50';

export function Sidebar({
  open,
  onNavigate,
}: {
  open: boolean;
  onNavigate: () => void;
}) {
  const { settings, updateSettings, words } = useApp();
  const dueCount = words.filter(
    (w) => new Date(w.nextReviewAt).getTime() <= Date.now(),
  ).length;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 shrink-0 flex-col border-r border-border bg-surface transition-transform duration-200 lg:static lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center gap-3 border-b border-border px-5 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
          E
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold leading-tight text-foreground">
            English Study
          </p>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
            Workspace
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-muted/70">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `${navLinkClasses} ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted hover:bg-surface-hover hover:text-foreground'
                    }`
                  }
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Icon size={18} className="shrink-0" />
                    <span className="truncate">{label}</span>
                  </span>
                  {to === '/review' && dueCount > 0 && (
                    <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
                      {dueCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-border p-3">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            `${navLinkClasses} ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted hover:bg-surface-hover hover:text-foreground'
            }`
          }
        >
          <span className="flex items-center gap-2.5">
            <SettingsIcon size={18} />
            Ayarlar
          </span>
        </NavLink>
        <button
          onClick={() =>
            updateSettings({
              theme: settings.theme === 'dark' ? 'light' : 'dark',
            })
          }
          className={`${navLinkClasses} w-full text-muted hover:bg-surface-hover hover:text-foreground`}
        >
          <span className="flex items-center gap-2.5">
            {settings.theme === 'dark' ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
            {settings.theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
          </span>
        </button>
      </div>
    </aside>
  );
}
