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
    <div className="mx-auto mt-24 max-w-sm rounded-lg border border-slate-200 p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Luo tili</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Nimi (valinnainen)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded border border-slate-300 px-3 py-2"
        />
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
          minLength={8}
          placeholder="Salasana (väh. 8 merkkiä)"
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
          {submitting ? 'Luodaan…' : 'Luo tili'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        On jo tili?{' '}
        <Link to="/login" className="text-slate-900 underline">
          Kirjaudu
        </Link>
      </p>
    </div>
  );
}
