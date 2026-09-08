import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getMe,
  login as apiLogin,
  loginDemo as apiLoginDemo,
  logout as apiLogout,
  type AuthScope,
} from '../lib/api';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  scope: AuthScope | null;
  login: (username: string, password: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [scope, setScope] = useState<AuthScope | null>(null);

  useEffect(() => {
    getMe().then((result) => {
      setScope(result);
      setStatus(result ? 'authenticated' : 'unauthenticated');
    });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const result = await apiLogin(username, password);
    setScope(result);
    setStatus('authenticated');
  }, []);

  const loginDemo = useCallback(async () => {
    const result = await apiLoginDemo();
    setScope(result);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setScope(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, scope, login, loginDemo, logout }),
    [status, scope, login, loginDemo, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
