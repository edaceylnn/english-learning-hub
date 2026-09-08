export type StoreKey = 'words' | 'notes' | 'lessonNotes' | 'todos' | 'reviewLog' | 'settings';
export type AuthScope = 'real' | 'demo';

export async function fetchState(): Promise<Partial<Record<StoreKey, unknown>>> {
  const res = await fetch('/api/state');
  if (!res.ok) throw new Error(`Failed to load state: ${res.status}`);
  return res.json();
}

export async function getMe(): Promise<AuthScope | null> {
  const res = await fetch('/api/me');
  if (!res.ok) return null;
  const data = await res.json();
  return data.scope;
}

export async function login(username: string, password: string): Promise<AuthScope> {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Giriş başarısız.');
  return data.scope;
}

export async function loginDemo(): Promise<AuthScope> {
  const res = await fetch('/api/login/demo', { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Demo girişi başarısız.');
  return data.scope;
}

export async function logout(): Promise<void> {
  await fetch('/api/logout', { method: 'POST' });
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
