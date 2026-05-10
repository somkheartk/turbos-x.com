const BASE_URL =
  globalThis.window === undefined
    ? (process.env.API_BASE_URL ?? 'http://127.0.0.1:3001/api')
    : '/api';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly path: string,
  ) {
    super(`API ${status}: ${path}`);
    this.name = 'ApiError';
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) throw new ApiError(res.status, path);
  return res.json() as Promise<T>;
}
