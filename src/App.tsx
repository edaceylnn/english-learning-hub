import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Route, Routes } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { WordsPage } from './pages/WordsPage';
import { GamePage } from './pages/GamePage';
import { NotesPage } from './pages/NotesPage';
import { LessonNotesPage } from './pages/LessonNotesPage';
import { TodosPage } from './pages/TodosPage';
import { CalendarPage } from './pages/CalendarPage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

function App() {
  const { status } = useAuth();

  if (status === 'checking') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <p className="text-sm text-muted">Yükleniyor…</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <LoginPage />;
  }

  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <button
          aria-label="Menüyü kapat"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-hover hover:text-foreground"
            aria-label="Menüyü aç"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-foreground">
            English Study Workspace
          </span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1360px] p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/words" element={<WordsPage />} />
              <Route path="/game" element={<GamePage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/lessons" element={<LessonNotesPage />} />
              <Route path="/todos" element={<TodosPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
