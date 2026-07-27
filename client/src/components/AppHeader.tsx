import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AppHeaderProps {
  active?: 'tasks' | 'api-keys';
}

export function AppHeader({ active }: AppHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              T
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">Todo Scheduler</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link
              to="/"
              className={`hidden font-medium sm:inline ${
                active === 'tasks' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tehtävät
            </Link>
            <Link
              to="/api-keys"
              className={`font-medium ${
                active === 'api-keys' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              API-avaimet
            </Link>
            <span className="hidden text-slate-400 md:inline">
              {user?.isDemo ? 'Demo-käyttäjä' : user?.email}
            </span>
            <button
              onClick={() => logout()}
              className="rounded-lg px-2.5 py-1.5 font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Kirjaudu ulos
            </button>
          </div>
        </div>
      </header>
      {user?.isDemo && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
          ✨ Olet demotilassa esimerkkidatalla. Tiedot eivät ole pysyviä.{' '}
          <Link to="/register" className="font-medium underline">
            Luo oma tili
          </Link>{' '}
          pitääksesi tehtäväsi.
        </div>
      )}
    </>
  );
}
