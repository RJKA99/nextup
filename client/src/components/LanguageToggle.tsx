import { useLanguage } from '../i18n/LanguageContext';
import type { Locale } from '../i18n/translations';

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  function button(value: Locale, label: string) {
    return (
      <button
        type="button"
        onClick={() => setLocale(value)}
        className={`px-2 py-1 text-xs font-semibold transition ${
          locale === value ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-slate-300">
      {button('en', 'EN')}
      {button('fi', 'FI')}
    </div>
  );
}
