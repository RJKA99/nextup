import { useTheme } from '../theme/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-sm transition hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
