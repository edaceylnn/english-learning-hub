import type { TodoPriority, TodoStatus, WordStatus, WordType } from '../types';

export const wordTypeLabels: Record<WordType, string> = {
  noun: 'İsim',
  verb: 'Fiil',
  adjective: 'Sıfat',
  adverb: 'Zarf',
  phrase: 'Kalıp / İfade',
  other: 'Diğer',
};

export const wordStatusLabels: Record<WordStatus, string> = {
  new: 'Yeni',
  learning: 'Öğreniliyor',
  learned: 'Öğrenildi',
};

export const wordStatusTone: Record<WordStatus, 'slate' | 'amber' | 'green'> = {
  new: 'slate',
  learning: 'amber',
  learned: 'green',
};

export const todoPriorityLabels: Record<TodoPriority, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
};

export const todoPriorityTone: Record<TodoPriority, 'slate' | 'amber' | 'red'> = {
  low: 'slate',
  medium: 'amber',
  high: 'red',
};

export const todoStatusLabels: Record<TodoStatus, string> = {
  todo: 'Yapılacak',
  'in-progress': 'Devam Ediyor',
  done: 'Tamamlandı',
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
  });
}
