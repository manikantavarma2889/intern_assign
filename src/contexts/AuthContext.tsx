import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { api, clearToken, setToken, getToken } from '../lib/api';

export type User = {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
  created_at: string;
  updated_at?: string;
};

type Ctx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  applySession: (token: string, user: User, remember: boolean) => void;
};

const AuthContext = createContext<Ctx>({} as Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) { setUser(null); setLoading(false); return; }
    try {
      const res = await api<{ user: User }>('/api/me');
      setUser(res.user);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const res = await api<{ token: string; user: User }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, remember }),
      auth: false,
    });
    setToken(res.token, remember);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    try { await api('/api/logout', { method: 'POST' }); } catch { /* ignore */ }
    clearToken();
    setUser(null);
  }, []);

  const applySession = useCallback((token: string, u: User, remember: boolean) => {
    setToken(token, remember);
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh, applySession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
