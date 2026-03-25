import { Action, PlayResponse, AuthUser, LoginDto, RegisterDto } from '@/types/game';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function throwApiError(res: Response, fallback: string): Promise<never> {
  const body = await res.json().catch(() => ({}));
  const msg = body.message;
  throw new Error(Array.isArray(msg) ? msg[0] : (msg || fallback));
}

function getHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  // --- Auth ---
  async login(dto: LoginDto): Promise<{ access_token: string; user: AuthUser }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dto),
    });
    if (!res.ok) await throwApiError(res, 'Login failed');
    return res.json();
  },

  async register(dto: RegisterDto): Promise<{ access_token: string; user: AuthUser }> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dto),
    });
    if (!res.ok) await throwApiError(res, 'Register failed');
    return res.json();
  },

  async getMe(): Promise<AuthUser> {
    const res = await fetch(`${BASE_URL}/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },

  // --- Game ---
  async play(action: Action): Promise<PlayResponse> {
    const res = await fetch(`${BASE_URL}/game/play`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action }),
      credentials: 'include', // for cookie fallback
    });
    if (!res.ok) throw new Error('Play failed');
    return res.json();
  },

  async resetScore(): Promise<void> {
    const res = await fetch(`${BASE_URL}/game/reset`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Reset failed');
  },

  // --- Score ---
  async getHighScore(): Promise<{ highScore: number }> {
    const res = await fetch(`${BASE_URL}/score/high`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch high score');
    return res.json();
  },
};
