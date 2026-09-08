import { useMemo, useState } from 'react';
import { BookPlus, Plus, Search, Trash2, Pencil, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { LessonNote } from '../types';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Textarea,
} from '../components/ui';
import { formatDate } from '../lib/labels';

type FormState = {
  date: string;
  topic: string;
  learned: string;
  exampleSentences: string;
  teacherNotes: string;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm: FormState = {
  date: today(),
  topic: '',
  learned: '',
  exampleSentences: '',
  teacherNotes: '',
};

export function LessonNotesPage() {
  const { lessonNotes, addLessonNote, updateLessonNote, deleteLessonNote, importWordsFromLesson, words } =
    useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [importFor, setImportFor] = useState<LessonNote | null>(null);
  const [importRows, setImportRows] = useState<{ term: string; translation: string }[]>([
    { term: '', translation: '' },
  ]);

  const sorted = useMemo(
    () => [...lessonNotes].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [lessonNotes],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (lesson) =>
        lesson.topic.toLowerCase().includes(q) ||
        lesson.learned.toLowerCase().includes(q) ||
        lesson.teacherNotes.toLowerCase().includes(q) ||
        lesson.exampleSentences.some((s) => s.toLowerCase().includes(q)),
    );
  }, [sorted, search]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(lesson: LessonNote) {
    setEditingId(lesson.id);
    setForm({
      date: lesson.date,
      topic: lesson.topic,
      learned: lesson.learned,
      exampleSentences: lesson.exampleSentences.join('\n'),
      teacherNotes: lesson.teacherNotes,
    });
    setModalOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.topic.trim()) return;
    const exampleSentences = form.exampleSentences
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingId) {
      updateLessonNote(editingId, { ...form, exampleSentences });
    } else {
      addLessonNote({ ...form, exampleSentences, newWordIds: [] });
    }
    setModalOpen(false);
  }

  function openImport(lesson: LessonNote) {
    setImportFor(lesson);
    setImportRows([{ term: '', translation: '' }]);
  }

  function submitImport(e: React.FormEvent) {
    e.preventDefault();
    if (!importFor) return;
    const rows = importRows.filter((r) => r.term.trim() && r.translation.trim());
    if (rows.length > 0) importWordsFromLesson(importFor.id, rows);
    setImportFor(null);
  }

  return (
    <div>
      <PageHeader
        title="Ders Notları"
        subtitle={`${lessonNotes.length} ders kaydı`}
        action={
          <Button onClick={openAdd}>
            <Plus size={16} /> Yeni Ders Notu
          </Button>
        }
      />

      {sorted.length === 0 ? (
        <EmptyState
          title="Henüz ders notu yok"
          description="Derste öğrendiklerini kaydetmeye başla."
          action={
            <Button variant="secondary" onClick={openAdd}>
              <Plus size={16} /> Yeni Ders Notu
            </Button>
          }
        />
      ) : (
        <>
          <Card className="mb-5">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Konu, öğrenilenler veya notlarda ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </Card>

          {filtered.length === 0 ? (
            <EmptyState
              title="Sonuç bulunamadı"
              description="Farklı bir kelime dene veya aramayı temizle."
              action={
                <Button variant="secondary" onClick={() => setSearch('')}>
                  Aramayı Temizle
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((lesson) => (
                <Card key={lesson.id}>
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        {formatDate(lesson.date)}
                      </p>
                      <p className="text-base font-semibold text-slate-900 dark:text-zinc-50">
                        {lesson.topic}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" onClick={() => openImport(lesson)}>
                        <BookPlus size={14} /> Kelimeleri Aktar
                      </Button>
                      <Button variant="ghost" onClick={() => openEdit(lesson)}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" onClick={() => setDeleteId(lesson.id)}>
                        <Trash2 size={14} className="text-red-500" />
                      </Button>
                    </div>
                  </div>

                  {lesson.learned && (
                    <p className="mb-2 text-sm text-slate-600 dark:text-zinc-300">
                      <span className="font-medium">Öğrendiklerim: </span>
                      {lesson.learned}
                    </p>
                  )}

                  {lesson.exampleSentences.length > 0 && (
                    <ul className="mb-2 list-disc space-y-0.5 pl-5 text-sm italic text-slate-500 dark:text-zinc-400">
                      {lesson.exampleSentences.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  )}

                  {lesson.teacherNotes && (
                    <p className="mb-2 rounded-lg bg-slate-50 p-2 text-sm text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                      <span className="font-medium">Öğretmen notu: </span>
                      {lesson.teacherNotes}
                    </p>
                  )}

                  {lesson.newWordIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {lesson.newWordIds.map((id) => {
                        const w = words.find((word) => word.id === id);
                        return w ? <Badge key={id} tone="indigo">{w.term}</Badge> : null;
                      })}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Ders Notunu Düzenle' : 'Yeni Ders Notu'}
        wide
      >
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tarih">
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </Field>
            <Field label="Konu">
              <Input
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                required
              />
            </Field>
          </div>
          <Field label="Öğrendiklerim">
            <Textarea
              rows={3}
              value={form.learned}
              onChange={(e) => setForm({ ...form, learned: e.target.value })}
            />
          </Field>
          <Field label="Örnek cümleler (her satıra bir tane)">
            <Textarea
              rows={3}
              value={form.exampleSentences}
              onChange={(e) =>
                setForm({ ...form, exampleSentences: e.target.value })
              }
            />
          </Field>
          <Field label="Öğretmen notları">
            <Textarea
              rows={2}
              value={form.teacherNotes}
              onChange={(e) => setForm({ ...form, teacherNotes: e.target.value })}
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Vazgeç
            </Button>
            <Button type="submit">Kaydet</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!importFor}
        onClose={() => setImportFor(null)}
        title={`"${importFor?.topic}" dersinden kelime aktar`}
        wide
      >
        <form onSubmit={submitImport} className="space-y-3">
          <div className="space-y-2">
            {importRows.map((row, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Kelime"
                  value={row.term}
                  onChange={(e) =>
                    setImportRows((rows) =>
                      rows.map((r, idx) =>
                        idx === i ? { ...r, term: e.target.value } : r,
                      ),
                    )
                  }
                />
                <Input
                  placeholder="Anlamı"
                  value={row.translation}
                  onChange={(e) =>
                    setImportRows((rows) =>
                      rows.map((r, idx) =>
                        idx === i ? { ...r, translation: e.target.value } : r,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setImportRows((rows) => rows.filter((_, idx) => idx !== i))
                  }
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setImportRows((rows) => [...rows, { term: '', translation: '' }])
            }
          >
            <Plus size={14} /> Satır Ekle
          </Button>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setImportFor(null)}
            >
              Vazgeç
            </Button>
            <Button type="submit">Kelimeler'e Aktar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Ders notunu sil"
        description="Bu ders notunu silmek istediğine emin misin?"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteLessonNote(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
