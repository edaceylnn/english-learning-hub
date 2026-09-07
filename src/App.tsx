import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Route, Routes } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { WordsPage } from './pages/WordsPage';
import { ReviewPage } from './pages/ReviewPage';
import { GamePage } from './pages/GamePage';
import { NotesPage } from './pages/NotesPage';
import { LessonNotesPage } from './pages/LessonNotesPage';
import { TodosPage } from './pages/TodosPage';
import { CalendarPage } from './pages/CalendarPage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <button
          aria-label="Menüyü kapat"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Menüyü aç"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            English Study Workspace
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/words" element={<WordsPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/lessons" element={<LessonNotesPage />} />
            <Route path="/todos" element={<TodosPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
