import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, ApiError } from '../api/client';

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
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">API-avaimet</h1>
        <Link to="/" className="text-sm text-slate-600 underline">
          Takaisin tehtäviin
        </Link>
      </div>

      <p className="mb-4 text-sm text-slate-600">
        API-avaimilla AI-agentit voivat lisätä ja aikatauluttaa tehtäviä puolestasi MCP-palvelimen kautta.
        Anna avain vain luotettuun agenttiin.
      </p>

      {newKey && (
        <div className="mb-6 rounded-lg border-2 border-amber-500 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">
            Tallenna tämä avain nyt — sitä ei näytetä enää uudelleen:
          </p>
          <code className="mt-2 block break-all rounded bg-white px-3 py-2 text-sm">{newKey}</code>
          <button onClick={() => setNewKey(null)} className="mt-2 text-sm text-amber-900 underline">
            Olen tallentanut avaimen
          </button>
        </div>
      )}

      <form onSubmit={handleCreate} className="mb-6 flex gap-2 rounded-lg border border-slate-200 p-4">
        <input
          required
          placeholder="Avaimen nimi (esim. Claude Desktop)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded border border-slate-300 px-3 py-2"
        />
        <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-white">
          Luo avain
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {loading && <p className="text-slate-500">Ladataan…</p>}

      {!loading && (
        <ul className="flex flex-col gap-2">
          {keys.map((key) => (
            <li
              key={key._id}
              className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
            >
              <div>
                <p className="font-medium text-slate-900">{key.name}</p>
                <p className="text-sm text-slate-500">
                  {key.keyPrefix}… · luotu {new Date(key.createdAt).toLocaleDateString('fi-FI')}
                  {key.lastUsedAt
                    ? ` · käytetty viimeksi ${new Date(key.lastUsedAt).toLocaleDateString('fi-FI')}`
                    : ' · ei käytetty vielä'}
                </p>
              </div>
              <button onClick={() => handleDelete(key._id)} className="text-sm text-red-600 hover:underline">
                Peruuta
              </button>
            </li>
          ))}
          {keys.length === 0 && <p className="text-slate-500">Ei vielä API-avaimia.</p>}
        </ul>
      )}
    </div>
  );
}
