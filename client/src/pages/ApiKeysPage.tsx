import { useEffect, useState, type FormEvent } from 'react';
import { apiFetch, ApiError } from '../api/client';
import { AppHeader } from '../components/AppHeader';

interface ApiKeyMeta {
  _id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyMeta[]>([]);
  const [name, setName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await apiFetch<{ apiKeys: ApiKeyMeta[] }>('/api-keys');
      setKeys(res.apiKeys);
    } catch {
      setError('Avainten lataus epäonnistui');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await apiFetch<{ key: string }>('/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      setNewKey(res.key);
      setName('');
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Avaimen luonti epäonnistui');
    }
  }

  async function handleDelete(id: string) {
    await apiFetch(`/api-keys/${id}`, { method: 'DELETE' });
    await refresh();
  }

  return (
    <div className="min-h-screen">
      <AppHeader active="api-keys" />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">API-avaimet</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">
          API-avaimilla AI-agentit voivat lisätä ja aikatauluttaa tehtäviä puolestasi MCP-palvelimen kautta. Anna
          avain vain luotettuun agenttiin.
        </p>

        {newKey && (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              Tallenna tämä avain nyt — sitä ei näytetä enää uudelleen:
            </p>
            <code className="mt-2 block break-all rounded-lg bg-white px-3 py-2 text-sm shadow-sm">{newKey}</code>
            <button
              onClick={() => setNewKey(null)}
              className="mt-2 text-sm font-medium text-amber-900 hover:underline"
            >
              Olen tallentanut avaimen
            </button>
          </div>
        )}

        <form
          onSubmit={handleCreate}
          className="mb-6 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"
        >
          <input
            required
            placeholder="Avaimen nimi (esim. Claude Desktop)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Luo avain
          </button>
        </form>

        {error && <p className="mb-4 text-sm text-rose-600">{error}</p>}
        {loading && <p className="text-slate-500">Ladataan…</p>}

        {!loading && (
          <ul className="flex flex-col gap-2">
            {keys.map((key) => (
              <li
                key={key._id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-slate-900">{key.name}</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    <code className="text-xs">{key.keyPrefix}…</code> · luotu{' '}
                    {new Date(key.createdAt).toLocaleDateString('fi-FI')}
                    {key.lastUsedAt
                      ? ` · käytetty viimeksi ${new Date(key.lastUsedAt).toLocaleDateString('fi-FI')}`
                      : ' · ei käytetty vielä'}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(key._id)}
                  className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-rose-500 transition hover:bg-rose-50"
                >
                  Peruuta
                </button>
              </li>
            ))}
            {keys.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
                Ei vielä API-avaimia.
              </p>
            )}
          </ul>
        )}
      </main>
    </div>
  );
}
