import { useMemo, useState } from 'react';
import { ClipboardList, Plus, Search, Star, Trash2, Pencil } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Word, WordStatus } from '../types';
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
  Select,
  SpeakButton,
  Textarea,
} from '../components/ui';
import { wordStatusLabels, wordStatusTone, wordTypeLabels } from '../lib/labels';
import { parseBulkWords } from '../lib/bulkImport';

type FormState = {
  term: string;
  translation: string;
  example: string;
  notes: string;
  tags: string;
};

const emptyForm: FormState = {
  term: '',
  translation: '',
  example: '',
  notes: '',
  tags: '',
};

export function WordsPage() {
  const { words, addWord, addWordsBulk, updateWord, deleteWord, toggleFavoriteWord } =
    useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<WordStatus | 'all'>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [keepAdding, setKeepAdding] = useState(false);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const bulkRows = useMemo(() => parseBulkWords(bulkText), [bulkText]);
  const bulkValidRows = bulkRows.filter((r) => r.valid);

  const filtered = useMemo(() => {
    return words.filter((w) => {
      if (favoritesOnly && !w.favorite) return false;
      if (statusFilter !== 'all' && w.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !w.term.toLowerCase().includes(q) &&
          !w.translation.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [words, search, statusFilter, favoritesOnly]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(word: Word) {
    setEditingId(word.id);
    setForm({
      term: word.term,
      translation: word.translation,
      example: word.example,
      notes: word.notes,
      tags: word.tags.join(', '),
    });
    setModalOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.term.trim() || !form.translation.trim()) return;
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingId) {
      updateWord(editingId, { ...form, tags });
      setModalOpen(false);
    } else {
      addWord({ ...form, tags, type: 'other', favorite: false });
      if (keepAdding) {
        setForm(emptyForm);
      } else {
        setModalOpen(false);
      }
    }
  }

  function submitBulk(e: React.FormEvent) {
    e.preventDefault();
    if (bulkValidRows.length === 0) return;
    addWordsBulk(bulkValidRows.map((r) => ({ term: r.term, translation: r.translation })));
    setBulkText('');
    setBulkOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Kelimeler"
        subtitle={`${words.length} kelime kayıtlı`}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setBulkOpen(true)}>
              <ClipboardList size={16} /> Toplu Ekle
            </Button>
            <Button onClick={openAdd}>
              <Plus size={16} /> Yeni Kelime
            </Button>
          </div>
        }
      />

      <Card className="mb-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative lg:col-span-2">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              placeholder="Kelime veya anlam ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as WordStatus | 'all')
            }
          >
            <option value="all">Tüm durumlar</option>
            {Object.entries(wordStatusLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={favoritesOnly}
            onChange={(e) => setFavoritesOnly(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Sadece favoriler
        </label>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="Kelime bulunamadı"
          description="Filtreleri temizle veya yeni bir kelime ekle."
          action={
            <Button variant="secondary" onClick={openAdd}>
              <Plus size={16} /> Yeni Kelime Ekle
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((word) => (
            <Card key={word.id} className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-1">
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
                      {word.term}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {word.translation}
                    </p>
                  </div>
                  <SpeakButton text={word.term} />
                </div>
                <button
                  onClick={() => toggleFavoriteWord(word.id)}
                  className={`rounded-full p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    word.favorite ? 'text-amber-500' : 'text-slate-300'
                  }`}
                >
                  <Star size={16} fill={word.favorite ? 'currentColor' : 'none'} />
                </button>
              </div>

              {word.example && (
                <p className="text-sm italic text-slate-500 dark:text-slate-400">
                  "{word.example}"
                </p>
              )}

              <div className="flex flex-wrap items-center gap-1.5">
                <Badge>{wordTypeLabels[word.type]}</Badge>
                <Badge tone={wordStatusTone[word.status]}>
                  {wordStatusLabels[word.status]}
                </Badge>
                {word.tags.map((tag) => (
                  <Badge key={tag} tone="indigo">
                    #{tag}
                  </Badge>
                ))}
              </div>

              <div className="mt-2 flex justify-end gap-1 border-t border-slate-100 pt-2 dark:border-slate-800">
                <Button variant="ghost" onClick={() => openEdit(word)}>
                  <Pencil size={14} /> Düzenle
                </Button>
                <Button variant="ghost" onClick={() => setDeleteId(word.id)}>
                  <Trash2 size={14} className="text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Kelimeyi Düzenle' : 'Yeni Kelime Ekle'}
        wide
      >
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kelime / İfade">
              <Input
                autoFocus
                value={form.term}
                onChange={(e) => setForm({ ...form, term: e.target.value })}
                required
              />
            </Field>
            <Field label="Anlamı">
              <Input
                value={form.translation}
                onChange={(e) =>
                  setForm({ ...form, translation: e.target.value })
                }
                required
              />
            </Field>
          </div>
          <Field label="Örnek cümle">
            <Textarea
              rows={2}
              value={form.example}
              onChange={(e) => setForm({ ...form, example: e.target.value })}
            />
          </Field>
          <Field label="Notlar">
            <Textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Field>
          <Field label="Etiketler (virgülle ayır)">
            <Input
              placeholder="ör. iş, seyahat"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </Field>

          <div className="flex items-center justify-between pt-2">
            {!editingId ? (
              <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={keepAdding}
                  onChange={(e) => setKeepAdding(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Kaydettikten sonra yeni kelime eklemeye devam et
              </label>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setModalOpen(false)}
              >
                Vazgeç
              </Button>
              <Button type="submit">
                {editingId
                  ? 'Kaydet'
                  : keepAdding
                    ? 'Kaydet ve Yeni Kelime Ekle'
                    : 'Kaydet'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title="Toplu Kelime Ekle"
        wide
      >
        <form onSubmit={submitBulk} className="space-y-3">
          <Field label="Her satıra bir kelime: kelime - anlam">
            <Textarea
              autoFocus
              rows={8}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={'give up - vazgeçmek\nubiquitous - her yerde bulunan\nreluctant: isteksiz'}
            />
          </Field>

          {bulkRows.length > 0 && (
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2 dark:border-slate-700">
              {bulkRows.map((row, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded px-2 py-1 text-sm ${
                    row.valid
                      ? 'text-slate-600 dark:text-slate-300'
                      : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                  }`}
                >
                  {row.valid ? (
                    <>
                      <span className="font-medium">{row.term}</span>
                      <span className="text-slate-400">{row.translation}</span>
                    </>
                  ) : (
                    <span>Anlaşılamadı: "{row.raw}"</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {bulkValidRows.length} kelime eklenecek
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setBulkOpen(false)}
              >
                Vazgeç
              </Button>
              <Button type="submit" disabled={bulkValidRows.length === 0}>
                {bulkValidRows.length} Kelime Ekle
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Kelimeyi sil"
        description="Bu kelimeyi silmek istediğine emin misin? Bu işlem geri alınamaz."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteWord(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
