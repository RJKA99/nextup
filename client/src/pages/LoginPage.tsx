import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

export function LoginPage() {
  const { login, tryDemo } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kirjautuminen epäonnistui');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDemo() {
    setError(null);
    setDemoLoading(true);
    try {
      await tryDemo();
      navigate('/');
    } catch {
      setError('Demon käynnistys epäonnistui, yritä hetken kuluttua uudelleen');
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm">
            T
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Tervetuloa takaisin</h1>
          <p className="mt-1 text-sm text-slate-500">Kirjaudu sisään jatkaaksesi</p>
        </div>

        <button
          type="button"
          onClick={handleDemo}
          disabled={demoLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {demoLoading ? 'Valmistellaan demoa…' : '✨ Kokeile demoa ilman tunnuksia'}
        </button>

        <div className="my-5 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          tai kirjaudu
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <input
            type="email"
            required
            placeholder="Sähköposti"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          <input
            type="password"
            required
            placeholder="Salasana"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-1 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Kirjaudutaan…' : 'Kirjaudu'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Ei tiliä?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
            Luo tili
          </Link>
        </p>
      </div>
    </div>
  );
}
