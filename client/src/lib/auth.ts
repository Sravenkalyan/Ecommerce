import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthManager {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
      } catch (e) {
        localStorage.removeItem('auth_user');
      }
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/login', {
      email,
      password,
    });
    
    const data: AuthResponse = await response.json();
    this.setAuth(data);
    return data;
  }

  async register(email: string, password: string, firstName?: string, lastName?: string): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/register', {
      email,
      password,
      firstName,
      lastName,
    });
    
    const data: AuthResponse = await response.json();
    this.setAuth(data);
    return data;
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) return null;
    
    try {
      const response = await apiRequest('GET', '/api/auth/me');
      const data = await response.json();
      this.user = data.user;
      localStorage.setItem('auth_user', JSON.stringify(this.user));
      return this.user;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  private setAuth(data: AuthResponse) {
    this.token = data.token;
    this.user = data.user;
    localStorage.setItem('auth_token', this.token);
    localStorage.setItem('auth_user', JSON.stringify(this.user));
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }
}

export const auth = new AuthManager();

// Axios interceptor to add auth token
import { queryClient } from "./queryClient";

const originalRequest = apiRequest;
export const authenticatedApiRequest = async (
  method: string,
  url: string,
  data?: unknown
): Promise<Response> => {
  const token = auth.getToken();
  
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (res.status === 401) {
    auth.logout();
    window.location.href = '/';
  }

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }

  return res;
};
