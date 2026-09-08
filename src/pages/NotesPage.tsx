import { useMemo, useRef, useState } from 'react';
import {
  Bold,
  Heading2,
  Highlighter,
  Italic,
  List,
  LayoutGrid,
  Plus,
  Rows3,
  Search,
  Trash2,
  Pencil,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Note } from '../types';
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
  Select,
  Textarea,
} from '../components/ui';
import { applyFormat, renderRichText, type FormatAction } from '../lib/richText';
import { formatDate } from '../lib/labels';

const categories = ['Genel', 'Dilbilgisi', 'Kelime', 'Yazma', 'Konuşma'];

type FormState = {
  title: string;
  content: string;
  category: string;
  tags: string;
};

const emptyForm: FormState = {
  title: '',
  content: '',
  category: 'Genel',
  tags: '',
};

const NOTES_PAGE_SIZE = 9;

export function NotesPage() {
  const { notes, addNote, updateNote, deleteNote } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [view, setView] = useState<'card' | 'list'>('card');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filtered = useMemo(() => {
    return notes.filter((n) => {
      if (category !== 'all' && n.category !== category) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !n.title.toLowerCase().includes(q) &&
          !n.content.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [notes, search, category]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / NOTES_PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paginatedNotes = useMemo(
    () =>
      filtered.slice(
        (safePage - 1) * NOTES_PAGE_SIZE,
        safePage * NOTES_PAGE_SIZE,
      ),
    [filtered, safePage],
  );

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(note: Note) {
    setEditingId(note.id);
    setForm({
      title: note.title,
      content: note.content,
      category: note.category,
      tags: note.tags.join(', '),
    });
    setModalOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (editingId) {
      updateNote(editingId, { ...form, tags });
    } else {
      addNote({ ...form, tags });
    }
    setModalOpen(false);
  }

  function format(action: FormatAction) {
    applyFormat(textareaRef, action, form.content, (next) =>
      setForm((f) => ({ ...f, content: next })),
    );
  }

  return (
    <div>
      <PageHeader
        title="Notlar"
        subtitle={`${notes.length} not`}
        action={
          <Button onClick={openAdd}>
            <Plus size={16} /> Yeni Not
          </Button>
        }
      />

      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              placeholder="Notlarda ara..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="max-w-[180px]"
          >
            <option value="all">Tüm kategoriler</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <div className="flex overflow-hidden rounded-lg border border-slate-200 dark:border-zinc-700">
            <button
              onClick={() => setView('card')}
              className={`p-2 ${view === 'card' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
            >
              <Rows3 size={16} />
            </button>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="Not bulunamadı"
          description="Yeni bir not ekleyerek başla."
          action={
            <Button variant="secondary" onClick={openAdd}>
              <Plus size={16} /> Yeni Not
            </Button>
          }
        />
      ) : (
        <div
          className={
            view === 'card'
              ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'
              : 'space-y-3'
          }
        >
          {paginatedNotes.map((note) => (
            <Card key={note.id}>
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-zinc-50">
                    {note.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDate(note.updatedAt)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" onClick={() => openEdit(note)}>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="ghost" onClick={() => setDeleteId(note.id)}>
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </div>
              </div>
              <div
                className="prose-sm max-w-none text-sm text-slate-600 dark:text-zinc-300 [&_mark]:text-slate-900"
                dangerouslySetInnerHTML={{ __html: renderRichText(note.content) }}
              />
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge tone="indigo">{note.category}</Badge>
                {note.tags.map((t) => (
                  <Badge key={t}>#{t}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <PaginationControls
        page={safePage}
        pageCount={pageCount}
        total={filtered.length}
        pageSize={NOTES_PAGE_SIZE}
        onPageChange={setPage}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Notu Düzenle' : 'Yeni Not'}
        wide
      >
        <form onSubmit={submit} className="space-y-3">
          <Field label="Başlık">
            <Input
              autoFocus
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kategori">
              <Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Etiketler (virgülle ayır)">
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </Field>
          </div>
          <div>
            <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-zinc-400">
              İçerik
            </span>
            <div className="mb-1 flex gap-1 rounded-t-lg border border-b-0 border-slate-200 bg-slate-50 p-1.5 dark:border-zinc-700 dark:bg-zinc-800">
              {[
                { action: 'bold' as const, icon: Bold, title: 'Kalın' },
                { action: 'italic' as const, icon: Italic, title: 'İtalik' },
                { action: 'heading' as const, icon: Heading2, title: 'Başlık' },
                { action: 'list' as const, icon: List, title: 'Liste' },
                { action: 'highlight' as const, icon: Highlighter, title: 'Vurgu' },
              ].map(({ action, icon: Icon, title }) => (
                <button
                  key={action}
                  type="button"
                  title={title}
                  onClick={() => format(action)}
                  className="rounded p-1.5 text-slate-500 hover:bg-slate-200 dark:text-zinc-300 dark:hover:bg-slate-700"
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
            <Textarea
              ref={textareaRef}
              rows={8}
              className="rounded-t-none"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="**kalın**, _italik_, ## başlık, - liste, ==vurgu=="
            />
          </div>
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

      <ConfirmDialog
        open={!!deleteId}
        title="Notu sil"
        description="Bu notu silmek istediğine emin misin?"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteNote(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
