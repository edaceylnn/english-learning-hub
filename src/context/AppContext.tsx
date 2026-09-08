import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { generateId } from '../lib/storage';
import { fetchState, saveKey } from '../lib/api';
import { createInitialSchedule, scheduleNextReview } from '../lib/spacedRepetition';
import type {
  LessonNote,
  Note,
  ReviewAnswer,
  ReviewLogEntry,
  Settings,
  Todo,
  TodoStatus,
  Word,
} from '../types';

const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  dailyGoal: 10,
  displayName: '',
};

interface AppContextValue {
  words: Word[];
  notes: Note[];
  lessonNotes: LessonNote[];
  todos: Todo[];
  reviewLog: ReviewLogEntry[];
  settings: Settings;

  addWord: (data: Omit<Word,
    'id' | 'createdAt' | 'lastReviewedAt' | 'nextReviewAt' | 'interval' | 'repetitions' | 'easeFactor' | 'status'
  > & { status?: Word['status'] }) => Word;
  addWordsBulk: (rows: { term: string; translation: string }[]) => void;
  updateWord: (id: string, patch: Partial<Word>) => void;
  deleteWord: (id: string) => void;
  reviewWord: (id: string, answer: ReviewAnswer) => void;
  logWordPractice: (id: string, answer: ReviewAnswer) => void;
  toggleFavoriteWord: (id: string) => void;

  addNote: (data: Pick<Note, 'title' | 'content' | 'category' | 'tags'>) => Note;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  addLessonNote: (
    data: Omit<LessonNote, 'id' | 'createdAt'>,
  ) => LessonNote;
  updateLessonNote: (id: string, patch: Partial<LessonNote>) => void;
  deleteLessonNote: (id: string) => void;
  importWordsFromLesson: (
    lessonId: string,
    words: { term: string; translation: string }[],
  ) => void;

  addTodo: (data: Pick<Todo, 'title' | 'description' | 'priority' | 'dueDate'>) => Todo;
  updateTodo: (id: string, patch: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  cycleTodoStatus: (id: string) => void;

  updateSettings: (patch: Partial<Settings>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const nextTodoStatus: Record<TodoStatus, TodoStatus> = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: 'todo',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [words, setWords] = useState<Word[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [lessonNotes, setLessonNotes] = useState<LessonNote[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [reviewLog, setReviewLog] = useState<ReviewLogEntry[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetchState().then((data) => {
      setWords((data.words as Word[]) ?? []);
      setNotes((data.notes as Note[]) ?? []);
      setLessonNotes((data.lessonNotes as LessonNote[]) ?? []);
      setTodos((data.todos as Todo[]) ?? []);
      setReviewLog((data.reviewLog as ReviewLogEntry[]) ?? []);
      setSettings((data.settings as Settings) ?? DEFAULT_SETTINGS);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) saveKey('words', words);
  }, [words, ready]);
  useEffect(() => {
    if (ready) saveKey('notes', notes);
  }, [notes, ready]);
  useEffect(() => {
    if (ready) saveKey('lessonNotes', lessonNotes);
  }, [lessonNotes, ready]);
  useEffect(() => {
    if (ready) saveKey('todos', todos);
  }, [todos, ready]);
  useEffect(() => {
    if (ready) saveKey('reviewLog', reviewLog);
  }, [reviewLog, ready]);
  useEffect(() => {
    if (ready) saveKey('settings', settings);
  }, [settings, ready]);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    try {
      localStorage.setItem('theme', settings.theme);
    } catch {
      // localStorage unavailable — the login screen just won't match on next visit.
    }
  }, [settings.theme]);

  const value = useMemo<AppContextValue>(
    () => ({
      words,
      notes,
      lessonNotes,
      todos,
      reviewLog,
      settings,

      addWord: (data) => {
        const schedule = createInitialSchedule();
        const word: Word = {
          id: generateId(),
          createdAt: new Date().toISOString(),
          lastReviewedAt: null,
          status: data.status ?? 'new',
          ...schedule,
          ...data,
        };
        setWords((prev) => [word, ...prev]);
        return word;
      },
      addWordsBulk: (rows) => {
        const created = rows.map((row) => {
          const schedule = createInitialSchedule();
          const word: Word = {
            id: generateId(),
            term: row.term,
            translation: row.translation,
            type: 'other',
            example: '',
            notes: '',
            tags: [],
            status: 'new',
            favorite: false,
            createdAt: new Date().toISOString(),
            lastReviewedAt: null,
            ...schedule,
          };
          return word;
        });
        setWords((prev) => [...created, ...prev]);
      },
      updateWord: (id, patch) => {
        setWords((prev) =>
          prev.map((w) => (w.id === id ? { ...w, ...patch } : w)),
        );
      },
      deleteWord: (id) => {
        setWords((prev) => prev.filter((w) => w.id !== id));
      },
      reviewWord: (id, answer) => {
        const reviewedAt = new Date().toISOString();
        setWords((prev) =>
          prev.map((w) => {
            if (w.id !== id) return w;
            const result = scheduleNextReview(w, answer);
            return {
              ...w,
              ...result,
              lastReviewedAt: reviewedAt,
            };
          }),
        );
        setReviewLog((prev) => [
          {
            id: generateId(),
            wordId: id,
            answer,
            reviewedAt,
          },
          ...prev,
        ]);
      },
      logWordPractice: (id, answer) => {
        setReviewLog((prev) => [
          {
            id: generateId(),
            wordId: id,
            answer,
            reviewedAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      },
      toggleFavoriteWord: (id) => {
        setWords((prev) =>
          prev.map((w) =>
            w.id === id ? { ...w, favorite: !w.favorite } : w,
          ),
        );
      },

      addNote: (data) => {
        const now = new Date().toISOString();
        const note: Note = {
          id: generateId(),
          createdAt: now,
          updatedAt: now,
          ...data,
        };
        setNotes((prev) => [note, ...prev]);
        return note;
      },
      updateNote: (id, patch) => {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === id
              ? { ...n, ...patch, updatedAt: new Date().toISOString() }
              : n,
          ),
        );
      },
      deleteNote: (id) => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
      },

      addLessonNote: (data) => {
        const lesson: LessonNote = {
          id: generateId(),
          createdAt: new Date().toISOString(),
          ...data,
        };
        setLessonNotes((prev) =>
          [lesson, ...prev].sort((a, b) => (a.date < b.date ? 1 : -1)),
        );
        return lesson;
      },
      updateLessonNote: (id, patch) => {
        setLessonNotes((prev) =>
          prev.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        );
      },
      deleteLessonNote: (id) => {
        setLessonNotes((prev) => prev.filter((l) => l.id !== id));
      },
      importWordsFromLesson: (lessonId, newWords) => {
        const schedule = createInitialSchedule();
        const created = newWords.map((nw) => ({
          id: generateId(),
          term: nw.term,
          translation: nw.translation,
          type: 'other' as const,
          example: '',
          notes: '',
          tags: ['ders'],
          status: 'new' as const,
          favorite: false,
          createdAt: new Date().toISOString(),
          lastReviewedAt: null,
          ...schedule,
        }));
        setWords((prev) => [...created, ...prev]);
        setLessonNotes((prev) =>
          prev.map((l) =>
            l.id === lessonId
              ? {
                  ...l,
                  newWordIds: [...l.newWordIds, ...created.map((w) => w.id)],
                }
              : l,
          ),
        );
      },

      addTodo: (data) => {
        const todo: Todo = {
          id: generateId(),
          status: 'todo',
          createdAt: new Date().toISOString(),
          ...data,
        };
        setTodos((prev) => [todo, ...prev]);
        return todo;
      },
      updateTodo: (id, patch) => {
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        );
      },
      deleteTodo: (id) => {
        setTodos((prev) => prev.filter((t) => t.id !== id));
      },
      cycleTodoStatus: (id) => {
        setTodos((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, status: nextTodoStatus[t.status] } : t,
          ),
        );
      },

      updateSettings: (patch) => {
        setSettings((prev) => ({ ...prev, ...patch }));
      },
    }),
    [words, notes, lessonNotes, todos, reviewLog, settings],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
