import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { ThemeToggle } from '../components/ThemeToggle';
import { ApiError } from '../api/client';

export function LoginPage() {
  const { login, tryDemo } = useAuth();
  const { t } = useLanguage();
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
      setError(err instanceof ApiError ? err.message : t('login.submitError'));
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
      setError(t('login.demoError'));
    } finally {
      setDemoLoading(false);
    }
  }

  const features: Array<{ icon: string; title: string; body: string }> = [
    { icon: '🎯', title: t('landing.feature1Title'), body: t('landing.feature1Body') },
    { icon: '🤖', title: t('landing.feature2Title'), body: t('landing.feature2Body') },
    { icon: '📊', title: t('landing.feature3Title'), body: t('landing.feature3Body') },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto grid min-h-screen max-w-6xl gap-10 px-4 py-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-16">
        {/* Left — pitch */}
        <div className="order-2 lg:order-1">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm">
              N
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">NextUp</span>
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {t('landing.kicker')}
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
            {t('landing.headline')}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600 dark:text-slate-400">
            {t('landing.subheadline')}
          </p>

          {/* Mini preview of the "Do this next" card — anchors the pitch to the real product */}
          <div className="mt-8 max-w-sm overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 text-white shadow-lg shadow-indigo-600/20">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">{t('nextTask.title')}</p>
            <p className="mt-2 text-xl font-bold tracking-tight">{t('landing.previewTask')}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-indigo-100">
              <span className="rounded-full bg-white/10 px-2.5 py-1">{t('common.minutes', { minutes: 45 })}</span>
              <span className="rounded-full bg-white/10 px-2.5 py-1">{t('common.relevance', { relevance: 5 })}</span>
              <span className="rounded-full bg-white/10 px-2.5 py-1">{t('common.agentCreated')}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-5">
            {features.map((f) => (
              <div key={f.title} className="flex gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-lg dark:bg-indigo-950/60">
                  {f.icon}
                </span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{f.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — login card */}
        <div className="order-1 w-full max-w-sm justify-self-center lg:order-2 lg:justify-self-end">
          <div className="mb-3 flex justify-end gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm">
                N
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('login.title')}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('login.subtitle')}</p>
            </div>

            <button
              type="button"
              onClick={handleDemo}
              disabled={demoLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/70"
            >
              {demoLoading ? t('login.demoButtonLoading') : t('login.demoButton')}
            </button>

            <div className="my-5 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              {t('login.divider')}
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <input
                type="email"
                required
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              <input
                type="password"
                required
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="mt-1 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? t('login.submitting') : t('login.submit')}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              {t('login.noAccount')}{' '}
              <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                {t('login.createAccount')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
