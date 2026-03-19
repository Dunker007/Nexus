import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>({ 
    id: 'dlx-admin', 
    email: 'admin@dlxstudios.online', 
    name: 'Chris Barclay (Dev Override)' 
  });
  const loading = false; // Hardcode loading state to false

  useEffect(() => {
    // Auth bypassed for dev
  }, []);

  const login = () => {
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/url`, { credentials: 'include' })
      .then(r => {
        if (!r.ok) throw new Error(`auth/url returned ${r.status}`);
        const ct = r.headers.get('content-type') || '';
        if (!ct.includes('application/json')) throw new Error('auth/url returned non-JSON');
        return r.json();
      })
      .then(({ url }) => { window.location.href = url; })
      .catch(err => console.error('[Auth] login failed:', err));
  };

  const logout = async () => {
    await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
