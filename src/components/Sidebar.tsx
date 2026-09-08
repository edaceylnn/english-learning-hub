import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  CalendarDays,
  Gamepad2,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Moon,
  NotebookPen,
  Settings as SettingsIcon,
  Sparkles,
  StickyNote,
  Sun,
  BarChart3,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';

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
  'group flex h-10 items-center justify-between gap-2 rounded-lg px-3 text-[13px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 dark:focus-visible:ring-white/30';

const activeNavClasses =
  'border border-indigo-200/70 bg-indigo-500/[0.08] text-slate-950 shadow-[0_10px_24px_rgba(79,70,229,0.08)] dark:border-indigo-300/18 dark:bg-indigo-500/[0.12] dark:text-white dark:shadow-none';

const idleNavClasses =
  'text-slate-500 hover:bg-slate-950/[0.04] hover:text-slate-950 dark:text-white/58 dark:hover:bg-white/[0.07] dark:hover:text-white';

export function Sidebar({
  open,
  onNavigate,
}: {
  open: boolean;
  onNavigate: () => void;
}) {
  const { settings, updateSettings } = useApp();
  const { scope, logout } = useAuth();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white/[0.84] text-slate-950 shadow-[24px_0_70px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-transform duration-200 dark:border-white/10 dark:bg-[#151517] dark:text-white dark:shadow-[24px_0_70px_rgba(0,0,0,0.24)] lg:sticky lg:inset-y-auto lg:left-auto lg:top-4 lg:m-4 lg:h-[calc(100vh-2rem)] lg:translate-x-0 lg:rounded-[28px] lg:border ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center gap-3 border-b border-slate-200/80 px-5 py-5 dark:border-white/10">
        <BrandLogo className="h-9 w-9 shrink-0 drop-shadow-sm" />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold leading-tight text-slate-950 dark:text-white">
            English Study
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-white/45">
            Workspace
          </p>
        </div>
      </div>

      {scope === 'demo' && (
        <div className="mx-3 mt-3 flex items-center gap-1.5 rounded-lg border border-amber-200/70 bg-amber-50/80 px-2.5 py-1.5 text-[11px] font-medium text-amber-800 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/65">
          <Sparkles size={11} className="shrink-0 text-amber-500 dark:text-amber-300" />
          Demo modu — veriler periyodik sıfırlanır
        </div>
      )}

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-white/28">
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
                      isActive ? activeNavClasses : idleNavClasses
                    }`
                  }
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Icon size={18} className="shrink-0" />
                    <span className="truncate">{label}</span>
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-slate-200/80 p-3 dark:border-white/10">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            `${navLinkClasses} ${
              isActive ? activeNavClasses : idleNavClasses
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
          className={`${navLinkClasses} w-full ${idleNavClasses}`}
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
        <button
          onClick={() => logout()}
          className={`${navLinkClasses} w-full ${idleNavClasses}`}
        >
          <span className="flex items-center gap-2.5">
            <LogOut size={18} />
            Çıkış Yap
          </span>
        </button>
      </div>
    </aside>
  );
}
