import { NavLink } from 'react-router-dom';
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

const links = [
  { to: '/', label: 'Panel', icon: LayoutDashboard, end: true },
  { to: '/words', label: 'Kelimeler', icon: BookOpen },
  { to: '/review', label: 'Kelime Tekrarı', icon: Repeat },
  { to: '/game', label: 'Oyun', icon: Gamepad2 },
  { to: '/notes', label: 'Notlar', icon: StickyNote },
  { to: '/lessons', label: 'Ders Notları', icon: NotebookPen },
  { to: '/todos', label: 'Yapılacaklar', icon: ListChecks },
  { to: '/calendar', label: 'Takvim', icon: CalendarDays },
  { to: '/stats', label: 'İstatistikler', icon: BarChart3 },
  { to: '/settings', label: 'Ayarlar', icon: SettingsIcon },
];

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
      className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
          E
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">
            English Study
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Workspace
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`
            }
          >
            <span className="flex items-center gap-2">
              <Icon size={17} />
              {label}
            </span>
            {to === '/review' && dueCount > 0 && (
              <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {dueCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <button
          onClick={() =>
            updateSettings({
              theme: settings.theme === 'dark' ? 'light' : 'dark',
            })
          }
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {settings.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          {settings.theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
        </button>
      </div>
    </aside>
  );
}
