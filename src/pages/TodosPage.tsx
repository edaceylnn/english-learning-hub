import { useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Todo, TodoPriority, TodoStatus } from '../types';
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
  Textarea,
} from '../components/ui';
import {
  formatDate,
  todoPriorityLabels,
  todoPriorityTone,
  todoStatusLabels,
} from '../lib/labels';

type FormState = {
  title: string;
  description: string;
  priority: TodoPriority;
  dueDate: string;
};

const emptyForm: FormState = {
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
};

export function TodosPage() {
  const { todos, addTodo, updateTodo, deleteTodo, cycleTodoStatus } = useApp();
  const [statusFilter, setStatusFilter] = useState<TodoStatus | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return todos
      .filter((t) => statusFilter === 'all' || t.status === statusFilter)
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'done' ? 1 : -1;
        return (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999');
      });
  }, [todos, statusFilter]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(todo: Todo) {
    setEditingId(todo.id);
    setForm({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      dueDate: todo.dueDate ?? '',
    });
    setModalOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = {
      title: form.title,
      description: form.description,
      priority: form.priority,
      dueDate: form.dueDate || null,
    };
    if (editingId) updateTodo(editingId, payload);
    else addTodo(payload);
    setModalOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Yapılacaklar"
        subtitle={`${todos.filter((t) => t.status !== 'done').length} açık görev`}
        action={
          <Button onClick={openAdd}>
            <Plus size={16} /> Yeni Görev
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {(['all', 'todo', 'in-progress', 'done'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              statusFilter === s
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            {s === 'all' ? 'Tümü' : todoStatusLabels[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Görev bulunamadı"
          action={
            <Button variant="secondary" onClick={openAdd}>
              <Plus size={16} /> Yeni Görev
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((todo) => (
            <Card key={todo.id} className="flex items-start gap-3">
              <button
                onClick={() => cycleTodoStatus(todo.id)}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  todo.status === 'done'
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : todo.status === 'in-progress'
                      ? 'border-amber-500'
                      : 'border-slate-300 dark:border-zinc-600'
                }`}
                title="Durumu değiştir"
              >
                {todo.status === 'done' && <Check size={12} />}
              </button>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={`font-medium ${
                      todo.status === 'done'
                        ? 'text-slate-400 line-through'
                        : 'text-slate-900 dark:text-zinc-50'
                    }`}
                  >
                    {todo.title}
                  </p>
                  <div className="flex gap-1">
                    <Button variant="ghost" onClick={() => openEdit(todo)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" onClick={() => setDeleteId(todo.id)}>
                      <Trash2 size={14} className="text-red-500" />
                    </Button>
                  </div>
                </div>
                {todo.description && (
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-zinc-400">
                    {todo.description}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge tone={todoPriorityTone[todo.priority]}>
                    {todoPriorityLabels[todo.priority]}
                  </Badge>
                  <Badge>{todoStatusLabels[todo.status]}</Badge>
                  {todo.dueDate && (
                    <Badge tone="indigo">{formatDate(todo.dueDate)}</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Görevi Düzenle' : 'Yeni Görev'}
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
          <Field label="Açıklama">
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Öncelik">
              <Select
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value as TodoPriority })
                }
              >
                {Object.entries(todoPriorityLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Bitiş tarihi">
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </Field>
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
        title="Görevi sil"
        description="Bu görevi silmek istediğine emin misin?"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteTodo(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
