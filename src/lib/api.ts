// Thin fetch wrapper that attaches the stored JWT and returns parsed JSON.

const TOKEN_KEY = 'secureauth.token';
const REMEMBER_KEY = 'secureauth.remember';

export function getToken(): string | null {
  return (
    localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null
  );
}

export function setToken(token: string, remember: boolean) {
  clearToken();
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REMEMBER_KEY, '1');
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REMEMBER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export type ApiError = { error: string; status: number; extra?: any };

export async function api<T = any>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.auth !== false) {
    const t = getToken();
    if (t) headers.set('Authorization', `Bearer ${t}`);
  }

  const res = await fetch(path, { ...options, headers });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON */ }

  if (!res.ok) {
    const err: ApiError = {
      error: json?.error || `Request failed (${res.status})`,
      status: res.status,
      extra: json,
    };
    throw err;
  }
  return json as T;
}
