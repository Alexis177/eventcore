import { api } from './api';
import type { AuthResponse, User } from '../types';

class AuthService {
  private TOKEN_KEY = 'token';
  private USER_KEY = 'user';

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>('/auth/login', { email, password }, false);
    localStorage.setItem(this.TOKEN_KEY, data.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
    return data;
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>('/auth/register', { name, email, password }, false);
    localStorage.setItem(this.TOKEN_KEY, data.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
    return data;
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getToken() { return localStorage.getItem(this.TOKEN_KEY); }

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as User; } catch { return null; }
  }

  isAuthenticated() { return !!this.getToken(); }

  async fetchMe(): Promise<User | null> {
    try {
      const user = await api.get<User>('/auth/me');
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      return user;
    } catch {
      this.logout();
      return null;
    }
  }

  async updatePreferences(preferences: { categories: string[] }): Promise<User> {
    const user = await api.put<User>('/auth/preferences', { preferences });
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    return user;
  }
}

export const authService = new AuthService();
