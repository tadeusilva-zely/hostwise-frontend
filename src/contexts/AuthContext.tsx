import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, setAuthToken } from '../services/api';
import { queryClient } from '../lib/queryClient';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  cnpj: string | null;
  phone: string | null;
  role: 'OWNER' | 'MEMBER';
  plan: 'STARTER' | 'INSIGHT' | 'PRO';
  effectivePlan: 'STARTER' | 'INSIGHT' | 'PRO';
  trialEndsAt: string | null;
  isTrialActive: boolean;
  limits: {
    maxCompetitors: number;
    maxProperties: number;
    updateIntervalHours: number;
    horizonDays: number;
    hasHistory: boolean;
    hasAlerts: boolean;
  };
  tourPreferences: {
    seen: Record<string, boolean>;
    dismissCount: Record<string, number>;
  } | null;
  createdAt: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  cnpj?: string;
  phone?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'hw_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  // On mount, validate existing token
  useEffect(() => {
    if (token) {
      setAuthToken(token);
      api
        .get('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY);
          setAuthToken(null);
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken } = res.data;
    localStorage.setItem(TOKEN_KEY, newToken);
    setAuthToken(newToken);
    setToken(newToken);
    // Fetch full user info
    const meRes = await api.get('/auth/me');
    setUser(meRes.data);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const res = await api.post('/auth/register', data);
    const { token: newToken } = res.data;
    localStorage.setItem(TOKEN_KEY, newToken);
    setAuthToken(newToken);
    setToken(newToken);
    // Fetch full user info
    const meRes = await api.get('/auth/me');
    setUser(meRes.data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
    queryClient.clear();
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await api.get('/auth/me');
    setUser(res.data);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
