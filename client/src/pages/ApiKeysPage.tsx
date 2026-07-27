import { useEffect, useState, type FormEvent } from 'react';
import { apiFetch, ApiError } from '../api/client';
import { AppHeader } from '../components/AppHeader';
import { useLanguage } from '../i18n/LanguageContext';
import { formatDate } from '../utils/formatDate';

interface ApiKeyMeta {
  _id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export function ApiKeysPage() {
  const { t, locale } = useLanguage();
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
      setError(t('apiKeys.loadError'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setError(err instanceof ApiError ? err.message : t('apiKeys.createError'));
    }
  }

  async function handleDelete(id: string) {
    await apiFetch(`/api-keys/${id}`, { method: 'DELETE' });
    await refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AppHeader active="api-keys" />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('apiKeys.title')}</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500 dark:text-slate-400">{t('apiKeys.description')}</p>

        {newKey && (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">{t('apiKeys.saveKeyNotice')}</p>
            <code className="mt-2 block break-all rounded-lg bg-white px-3 py-2 text-sm shadow-sm dark:bg-slate-900 dark:text-slate-100">
              {newKey}
            </code>
            <button
              onClick={() => setNewKey(null)}
              className="mt-2 text-sm font-medium text-amber-900 hover:underline dark:text-amber-300"
            >
              {t('apiKeys.savedConfirm')}
            </button>
          </div>
        )}

        <form
          onSubmit={handleCreate}
          className="mb-6 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row dark:border-slate-700 dark:bg-slate-800"
        >
          <input
            required
            placeholder={t('apiKeys.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            {t('apiKeys.createButton')}
          </button>
        </form>

        {error && <p className="mb-4 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        {loading && <p className="text-slate-500 dark:text-slate-400">{t('apiKeys.loading')}</p>}

        {!loading && (
          <ul className="flex flex-col gap-2">
            {keys.map((key) => (
              <li
                key={key._id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{key.name}</p>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    <code className="text-xs">{key.keyPrefix}…</code> ·{' '}
                    {t('apiKeys.createdLabel', { date: formatDate(key.createdAt, locale) })}
                    {key.lastUsedAt
                      ? ` · ${t('apiKeys.lastUsedLabel', { date: formatDate(key.lastUsedAt, locale) })}`
                      : ` · ${t('apiKeys.neverUsed')}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(key._id)}
                  className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  {t('apiKeys.revoke')}
                </button>
              </li>
            ))}
            {keys.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                {t('apiKeys.empty')}
              </p>
            )}
          </ul>
        )}
      </main>
    </div>
  );
}
