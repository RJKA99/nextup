import { useLanguage } from '../i18n/LanguageContext';

interface OnboardingCardProps {
  onDismiss: () => void;
}

export function OnboardingCard({ onDismiss }: OnboardingCardProps) {
  const { t } = useLanguage();

  const steps = [
    { title: t('onboarding.step1Title'), body: t('onboarding.step1Body') },
    { title: t('onboarding.step2Title'), body: t('onboarding.step2Body') },
    { title: t('onboarding.step3Title'), body: t('onboarding.step3Body') },
    { title: t('onboarding.step4Title'), body: t('onboarding.step4Body') },
  ];

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('onboarding.title')}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
        >
          {t('onboarding.dismiss')}
        </button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {steps.map((s) => (
          <div key={s.title}>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{s.title}</p>
            <p className="mt-0.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
