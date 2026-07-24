import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="mx-auto mt-24 max-w-sm rounded-lg border border-slate-200 p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Kirjaudu sisään</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="Sähköposti"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border border-slate-300 px-3 py-2"
        />
        <input
          type="password"
          required
          placeholder="Salasana"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border border-slate-300 px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-slate-900 px-3 py-2 text-white disabled:opacity-50"
        >
          {submitting ? 'Kirjaudutaan…' : 'Kirjaudu'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Ei tiliä?{' '}
        <Link to="/register" className="text-slate-900 underline">
          Luo tili
        </Link>
      </p>
    </div>
  );
}
