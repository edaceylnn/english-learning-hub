export type StoreKey = 'words' | 'notes' | 'lessonNotes' | 'todos' | 'reviewLog' | 'settings';

export async function fetchState(): Promise<Partial<Record<StoreKey, unknown>>> {
  const res = await fetch('/api/state');
  if (!res.ok) throw new Error(`Failed to load state: ${res.status}`);
  return res.json();
}

export function saveKey(key: StoreKey, value: unknown): void {
  fetch(`/api/state/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  }).catch((err) => {
    console.error(`Failed to save ${key}`, err);
  });
}
