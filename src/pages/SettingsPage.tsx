import { useRef, useState } from 'react';
import { Download, Moon, Sun, Trash2, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Card, ConfirmDialog, Field, Input, PageHeader } from '../components/ui';
import { saveKey, type StoreKey } from '../lib/api';

const DATA_KEYS: StoreKey[] = ['words', 'notes', 'lessonNotes', 'todos', 'reviewLog', 'settings'];

export function SettingsPage() {
  const { words, notes, lessonNotes, todos, reviewLog, settings, updateSettings } = useApp();
  const [resetOpen, setResetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function exportData() {
    const dump = { words, notes, lessonNotes, todos, reviewLog, settings };
    const blob = new Blob([JSON.stringify(dump, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `english-study-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        DATA_KEYS.forEach((key) => {
          if (key in parsed) saveKey(key, parsed[key]);
        });
        window.location.reload();
      } catch {
        alert('Dosya okunamadı. Geçerli bir yedek dosyası seçtiğinden emin ol.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function resetAll() {
    DATA_KEYS.forEach((key) => saveKey(key, key === 'settings' ? settings : []));
    window.location.reload();
  }

  return (
    <div>
      <PageHeader title="Ayarlar" subtitle="Uygulama tercihlerini yönet" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <p className="mb-4 font-semibold text-slate-900 dark:text-slate-50">
            Genel
          </p>
          <div className="space-y-3">
            <Field label="Görünen isim">
              <Input
                value={settings.displayName}
                onChange={(e) => updateSettings({ displayName: e.target.value })}
                placeholder="Adın"
              />
            </Field>
            <Field label="Günlük tekrar hedefi">
              <Input
                type="number"
                min={1}
                value={settings.dailyGoal}
                onChange={(e) =>
                  updateSettings({ dailyGoal: Number(e.target.value) || 1 })
                }
              />
            </Field>
            <div>
              <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Tema
              </span>
              <div className="flex gap-2">
                <Button
                  variant={settings.theme === 'light' ? 'primary' : 'secondary'}
                  onClick={() => updateSettings({ theme: 'light' })}
                >
                  <Sun size={16} /> Açık
                </Button>
                <Button
                  variant={settings.theme === 'dark' ? 'primary' : 'secondary'}
                  onClick={() => updateSettings({ theme: 'dark' })}
                >
                  <Moon size={16} /> Koyu
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <p className="mb-4 font-semibold text-slate-900 dark:text-slate-50">
            Veri Yönetimi
          </p>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Tüm verilerin bu tarayıcıda saklanır. Yedek al veya başka bir
            tarayıcıya taşımak için dışa/içe aktar.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={exportData}>
              <Download size={16} /> Dışa Aktar
            </Button>
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} /> İçe Aktar
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              hidden
              onChange={importData}
            />
            <Button variant="danger" onClick={() => setResetOpen(true)}>
              <Trash2 size={16} /> Tüm Verileri Sıfırla
            </Button>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={resetOpen}
        title="Tüm verileri sıfırla"
        description="Kelimeler, notlar, ders notları ve görevler dahil tüm verilerin silinecek. Bu işlem geri alınamaz."
        onCancel={() => setResetOpen(false)}
        onConfirm={resetAll}
      />
    </div>
  );
}
