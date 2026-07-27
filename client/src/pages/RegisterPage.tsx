import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(email, password, name || undefined);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Rekisteröinti epäonnistui');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm">
            T
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Luo tili</h1>
          <p className="mt-1 text-sm text-slate-500">Aloita tehtävien priorisointi</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <input
            type="text"
            placeholder="Nimi (valinnainen)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
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
            minLength={8}
            placeholder="Salasana (väh. 8 merkkiä)"
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
            {submitting ? 'Luodaan…' : 'Luo tili'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          On jo tili?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
            Kirjaudu
          </Link>
        </p>
      </div>
    </div>
  );
}
