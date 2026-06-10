import { toast } from 'sonner';

const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3000/api';

// Callback que App registra para ejecutar logout cuando el token expira
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

class ApiClient {
  private baseUrl: string;
  constructor(baseUrl: string) { this.baseUrl = baseUrl; }

  private getToken() { return localStorage.getItem('token'); }

  private buildHeaders(requiresAuth: boolean): HeadersInit {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (requiresAuth) {
      const t = this.getToken();
      if (t) headers['Authorization'] = `Bearer ${t}`;
    }
    return headers;
  }

  async request<T>(
    endpoint: string,
    options: { method?: string; body?: unknown; requiresAuth?: boolean } = {}
  ): Promise<T> {
    const { method = 'GET', body, requiresAuth = true } = options;
    const config: RequestInit = { method, headers: this.buildHeaders(requiresAuth) };
    if (body !== undefined) config.body = JSON.stringify(body);

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);
    const data = await response.json();

    // Token expirado o inválido → cerrar sesión automáticamente
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      onUnauthorized?.();
      toast.error('Tu sesión ha expirado. Redirigiendo al login...');
      setTimeout(() => {
        window.location.href = '/login'; // Forzamos salida segura
      }, 1500);
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    }

    if (!response.ok) throw new Error(data.message ?? 'Error desconocido del servidor');
    return data.data as T;
  }

  get<T>(endpoint: string, requiresAuth = true) {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth });
  }
  post<T>(endpoint: string, body: unknown, requiresAuth = true) {
    return this.request<T>(endpoint, { method: 'POST', body, requiresAuth });
  }
  put<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }
  patch<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }
  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(BASE_URL);
