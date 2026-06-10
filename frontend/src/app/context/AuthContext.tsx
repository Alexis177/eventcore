import {
  createContext, useContext, useState, useCallback,
  useEffect, type ReactNode,
} from 'react';
import { authService } from '../services/authService';
import { setUnauthorizedHandler } from '../services/api';
import type { User, UserRole } from '../types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isVerifying: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: (reason?: 'expired' | 'manual') => void;
  hasRole: (...roles: UserRole[]) => boolean;
  updatePreferences: (preferences: { categories: string[] }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const logout = useCallback((reason: 'expired' | 'manual' = 'manual') => {
    authService.logout();
    setUser(null);
    if (reason === 'expired') setSessionExpired(true);
  }, []);

  // Registrar el handler de 401 para que api.ts pueda disparar logout
  useEffect(() => {
    setUnauthorizedHandler(() => logout('expired'));
  }, [logout]);

  // Verificar token al montar
  useEffect(() => {
    if (!authService.isAuthenticated()) { setIsVerifying(false); return; }
    authService.fetchMe()
      .then((u) => setUser(u))
      .finally(() => setIsVerifying(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await authService.login(email, password);
    setUser(user);
    setSessionExpired(false);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { user } = await authService.register(name, email, password);
    setUser(user);
    setSessionExpired(false);
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => !!user && roles.includes(user.role),
    [user]
  );

  const updatePreferences = useCallback(async (preferences: { categories: string[] }) => {
    const updatedUser = await authService.updatePreferences(preferences);
    setUser(updatedUser);
  }, []);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-semibold">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, isVerifying, login, register, logout, hasRole, updatePreferences,
    }}>
      {/* Banner de sesión expirada */}
      {sessionExpired && !user && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-sm text-center py-3 px-4 flex items-center justify-center gap-2 shadow-lg font-medium">
          <span>⏱</span>
          <span>Tu sesión expiró. Por favor inicia sesión nuevamente.</span>
          <button
            onClick={() => setSessionExpired(false)}
            className="ml-4 underline hover:no-underline text-white/80 hover:text-white cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
