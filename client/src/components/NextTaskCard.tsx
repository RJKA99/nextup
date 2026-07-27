import { useState } from 'react';
import type { Task } from '../types';
import { explainScore } from '../utils/explainScore';
import { formatDate } from '../utils/formatDate';
import { useLanguage } from '../i18n/LanguageContext';

interface NextTaskCardProps {
  task: Task | null;
}

export function NextTaskCard({ task }: NextTaskCardProps) {
  const { t, locale } = useLanguage();
  const [showWhy, setShowWhy] = useState(false);

  if (!task) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-2xl">🎉</p>
        <p className="mt-2 font-medium text-slate-700">{t('nextTask.empty')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white shadow-lg shadow-indigo-600/20">
      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">{t('nextTask.title')}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{task.title}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-sm text-indigo-100">
        <span className="rounded-full bg-white/10 px-2.5 py-1">{t('common.minutes', { minutes: task.estimatedMinutes })}</span>
        <span className="rounded-full bg-white/10 px-2.5 py-1">{t('common.relevance', { relevance: task.relevance })}</span>
        {task.category && <span className="rounded-full bg-white/10 px-2.5 py-1">{task.category}</span>}
        {task.deadline && (
          <span className="rounded-full bg-white/10 px-2.5 py-1">
            {t('common.deadline', { date: formatDate(task.deadline, locale) })}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => setShowWhy((v) => !v)}
        className="mt-3 text-xs font-medium text-indigo-200 underline decoration-dotted hover:text-white"
      >
        {showWhy ? t('nextTask.hideWhy') : t('nextTask.why')}
      </button>
      {showWhy && <p className="mt-2 text-sm leading-relaxed text-indigo-100">{explainScore(task, t)}</p>}
    </div>
  );
}
