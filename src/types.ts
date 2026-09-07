export type WordType =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'phrase'
  | 'other';

export type WordStatus = 'new' | 'learning' | 'learned';

export interface Word {
  id: string;
  term: string;
  translation: string;
  type: WordType;
  example: string;
  notes: string;
  tags: string[];
  status: WordStatus;
  favorite: boolean;
  createdAt: string;
  lastReviewedAt: string | null;
  nextReviewAt: string;
  interval: number;
  repetitions: number;
  easeFactor: number;
}

export type ReviewAnswer = 'again' | 'hard' | 'good' | 'easy';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LessonNote {
  id: string;
  date: string;
  topic: string;
  learned: string;
  exampleSentences: string[];
  teacherNotes: string;
  newWordIds: string[];
  createdAt: string;
}

export type TodoPriority = 'low' | 'medium' | 'high';
export type TodoStatus = 'todo' | 'in-progress' | 'done';

export interface Todo {
  id: string;
  title: string;
  description: string;
  priority: TodoPriority;
  status: TodoStatus;
  dueDate: string | null;
  createdAt: string;
}

export type Theme = 'light' | 'dark';

export interface Settings {
  theme: Theme;
  dailyGoal: number;
  displayName: string;
}

export interface ReviewLogEntry {
  id: string;
  wordId: string;
  answer: ReviewAnswer;
  reviewedAt: string;
}
