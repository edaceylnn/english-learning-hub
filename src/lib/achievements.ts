import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Flame,
  GraduationCap,
  Library,
  Repeat,
  Sparkles,
  StickyNote,
  Trophy,
} from 'lucide-react';
import type { LessonNote, Note, ReviewLogEntry, Word } from '../types';
import { computeStreak } from './stats';

export interface AchievementContext {
  words: Word[];
  notes: Note[];
  lessonNotes: LessonNote[];
  reviewLog: ReviewLogEntry[];
}

export interface Achievement {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  isUnlocked: (ctx: AchievementContext) => boolean;
}

export const achievements: Achievement[] = [
  {
    id: 'first-word',
    label: 'İlk Adım',
    description: 'İlk kelimeni ekledin',
    icon: Sparkles,
    isUnlocked: (ctx) => ctx.words.length >= 1,
  },
  {
    id: 'words-25',
    label: 'Kelime Avcısı',
    description: '25 kelime ekledin',
    icon: BookOpen,
    isUnlocked: (ctx) => ctx.words.length >= 25,
  },
  {
    id: 'words-100',
    label: 'Kelime Koleksiyoncusu',
    description: '100 kelime ekledin',
    icon: Library,
    isUnlocked: (ctx) => ctx.words.length >= 100,
  },
  {
    id: 'learned-10',
    label: 'Sabırlı Öğrenci',
    description: '10 kelimeyi "öğrenildi" seviyesine getirdin',
    icon: GraduationCap,
    isUnlocked: (ctx) => ctx.words.filter((w) => w.status === 'learned').length >= 10,
  },
  {
    id: 'streak-7',
    label: '7 Günlük Seri',
    description: '7 gün üst üste tekrar yaptın',
    icon: Flame,
    isUnlocked: (ctx) => computeStreak(ctx.reviewLog) >= 7,
  },
  {
    id: 'streak-30',
    label: '30 Günlük Seri',
    description: '30 gün üst üste tekrar yaptın',
    icon: Trophy,
    isUnlocked: (ctx) => computeStreak(ctx.reviewLog) >= 30,
  },
  {
    id: 'reviews-50',
    label: 'Düzenli Öğrenci',
    description: '50 kez kelime tekrar ettin',
    icon: Repeat,
    isUnlocked: (ctx) => ctx.reviewLog.length >= 50,
  },
  {
    id: 'notes-10',
    label: 'Not Tutkunu',
    description: '10 not oluşturdun',
    icon: StickyNote,
    isUnlocked: (ctx) => ctx.notes.length >= 10,
  },
];
