const BASE_URL = process.env.TODO_SCHEDULER_API_URL ?? 'http://localhost:4000';
const API_KEY = process.env.TODO_SCHEDULER_API_KEY;

if (!API_KEY) {
  throw new Error('TODO_SCHEDULER_API_KEY environment variable is required');
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${API_KEY}`);

  const res = await fetch(`${BASE_URL}/api${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    throw new Error(body.error ?? `Request to ${path} failed with status ${res.status}`);
  }
  return body as T;
}
