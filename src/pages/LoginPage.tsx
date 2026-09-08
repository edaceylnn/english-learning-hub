import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton } from '../components/dashboard';
import { Field, Input } from '../components/ui';

export function LoginPage() {
  const { login, loginDemo } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<'login' | 'demo' | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Kullanıcı adı ve şifre gerekli.');
      return;
    }
    setError(null);
    setLoading('login');
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş başarısız.');
    } finally {
      setLoading(null);
    }
  }

  async function enterDemo() {
    setError(null);
    setLoading('demo');
    try {
      await loginDemo();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo girişi başarısız.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
            E
          </div>
          <h1 className="text-lg font-semibold text-foreground">English Study</h1>
          <p className="mt-1 text-sm text-muted">Devam etmek için giriş yap</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <Field label="Kullanıcı adı">
            <Input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Kullanıcı adın"
            />
          </Field>
          <Field label="Şifre">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <PrimaryButton type="submit" disabled={loading !== null} className="w-full">
            {loading === 'login' ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </PrimaryButton>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted">veya</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <PrimaryButton
          variant="secondary"
          onClick={enterDemo}
          disabled={loading !== null}
          className="w-full"
        >
          <Sparkles size={16} />
          {loading === 'demo' ? 'Açılıyor…' : 'Demo Olarak Gözat'}
        </PrimaryButton>
        <p className="mt-2 text-center text-xs text-muted">
          Örnek verilerle dolu, sadece keşfetmek için bir alan.
        </p>
      </div>
    </div>
  );
}
