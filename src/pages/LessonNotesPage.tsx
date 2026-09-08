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
  PaginationControls,
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

const LESSON_NOTES_PAGE_SIZE = 8;

export function LessonNotesPage() {
  const { lessonNotes, addLessonNote, updateLessonNote, deleteLessonNote, importWordsFromLesson, words } =
    useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

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

  const pageCount = Math.max(1, Math.ceil(filtered.length / LESSON_NOTES_PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paginatedLessons = useMemo(
    () =>
      filtered.slice(
        (safePage - 1) * LESSON_NOTES_PAGE_SIZE,
        safePage * LESSON_NOTES_PAGE_SIZE,
      ),
    [filtered, safePage],
  );

  const selectedLesson = useMemo(
    () =>
      paginatedLessons.find((lesson) => lesson.id === selectedId) ??
      paginatedLessons[0] ??
      null,
    [paginatedLessons, selectedId],
  );

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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
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
            <>
              <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.25fr)]">
              <div className="space-y-3">
                {paginatedLessons.map((lesson) => {
                  const active = selectedLesson?.id === lesson.id;
                  return (
                    <Card
                      key={lesson.id}
                      className={`cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/30 ${
                        active
                          ? 'border-primary/35 ring-2 ring-primary/10'
                          : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedId(lesson.id)}
                        className="block w-full text-left focus-visible:outline-none"
                      >
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                              {formatDate(lesson.date)}
                            </p>
                            <p className="truncate text-base font-semibold text-slate-900 dark:text-zinc-50">
                              {lesson.topic}
                            </p>
                          </div>
                        </div>

                        {lesson.learned && (
                          <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-zinc-300">
                            {lesson.learned}
                          </p>
                        )}

                        {lesson.teacherNotes && (
                          <p className="mt-2 line-clamp-2 rounded-lg bg-slate-50 p-2 text-sm text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                            {lesson.teacherNotes}
                          </p>
                        )}
                      </button>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                        <div className="flex flex-wrap gap-1.5">
                          {lesson.newWordIds.slice(0, 3).map((id) => {
                            const w = words.find((word) => word.id === id);
                            return w ? <Badge key={id} tone="indigo">{w.term}</Badge> : null;
                          })}
                          {lesson.newWordIds.length > 3 && (
                            <Badge tone="slate">+{lesson.newWordIds.length - 3}</Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" onClick={() => openImport(lesson)}>
                            <BookPlus size={14} /> Aktar
                          </Button>
                          <Button variant="ghost" onClick={() => openEdit(lesson)}>
                            <Pencil size={14} />
                          </Button>
                          <Button variant="ghost" onClick={() => setDeleteId(lesson.id)}>
                            <Trash2 size={14} className="text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {selectedLesson && (
                <Card className="xl:sticky xl:top-4 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                    <div>
                      <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        {formatDate(selectedLesson.date)}
                      </p>
                      <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-zinc-50">
                        {selectedLesson.topic}
                      </h2>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" onClick={() => openImport(selectedLesson)}>
                        <BookPlus size={14} /> Kelimeleri Aktar
                      </Button>
                      <Button variant="ghost" onClick={() => openEdit(selectedLesson)}>
                        <Pencil size={14} />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <section>
                      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                        Öğrendiklerim
                      </h3>
                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-zinc-300">
                        {selectedLesson.learned || 'Bu alan boş.'}
                      </p>
                    </section>

                    <section>
                      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                        Örnek Cümleler
                      </h3>
                      {selectedLesson.exampleSentences.length > 0 ? (
                        <ul className="space-y-2 text-sm italic leading-7 text-slate-600 dark:text-zinc-300">
                          {selectedLesson.exampleSentences.map((sentence, index) => (
                            <li
                              key={index}
                              className="rounded-lg border border-border bg-surface-hover px-3 py-2"
                            >
                              {sentence}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted">Örnek cümle yok.</p>
                      )}
                    </section>

                    <section>
                      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                        Öğretmen Notu
                      </h3>
                      <p className="whitespace-pre-wrap rounded-lg border border-border bg-surface-hover p-3 text-sm leading-7 text-slate-700 dark:text-zinc-300">
                        {selectedLesson.teacherNotes || 'Bu alan boş.'}
                      </p>
                    </section>

                    {selectedLesson.newWordIds.length > 0 && (
                      <section>
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                          Aktarılan Kelimeler
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedLesson.newWordIds.map((id) => {
                            const w = words.find((word) => word.id === id);
                            return w ? <Badge key={id} tone="indigo">{w.term}</Badge> : null;
                          })}
                        </div>
                      </section>
                    )}
                  </div>
                </Card>
              )}
              </div>

              <PaginationControls
                page={safePage}
                pageCount={pageCount}
                total={filtered.length}
                pageSize={LESSON_NOTES_PAGE_SIZE}
                onPageChange={setPage}
              />
            </>
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
