import { useState } from 'react';
import type { Task, TaskStatus } from '../types';
import { TaskFeedbackForm, type FeedbackValues } from './TaskFeedbackForm';
import { explainScore } from '../utils/explainScore';
import { formatDate } from '../utils/formatDate';
import { useLanguage } from '../i18n/LanguageContext';

interface TaskItemProps {
  task: Task;
  isSubtask?: boolean;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onFeedback: (id: string, values: FeedbackValues) => Promise<void>;
}

function scoreBadgeClass(score: number): string {
  if (score >= 0.7) return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';
  if (score >= 0.4) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
  return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
}

export function TaskItem({ task, isSubtask, onStatusChange, onDelete, onFeedback }: TaskItemProps) {
  const { t, locale } = useLanguage();
  const [showWhy, setShowWhy] = useState(false);
  const needsFeedback = task.status === 'done' && task.createdVia === 'agent' && task.estimateRating === null;

  const statusLabels: Record<TaskStatus, string> = {
    todo: t('status.todo'),
    in_progress: t('status.in_progress'),
    done: t('status.done'),
  };

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-slate-800 dark:hover:shadow-none ${
        isSubtask ? 'border-slate-100 bg-slate-50/60 dark:border-slate-700/60 dark:bg-slate-800/60' : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {isSubtask && <span className="text-slate-300 dark:text-slate-600">↳</span>}
            <p className={`font-semibold text-slate-900 dark:text-slate-100 ${task.status === 'done' ? 'line-through opacity-50' : ''}`}>
              {task.title}
            </p>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${scoreBadgeClass(task.score)}`}>
              {task.score.toFixed(2)}
            </span>
            {task.createdVia === 'agent' && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                {t('common.agentCreated')}
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
            {task.category ? `${task.category} · ` : ''}
            {t('common.minutes', { minutes: task.estimatedMinutes })} · {t('common.relevance', { relevance: task.relevance })}
            {task.deadline ? ` · ${t('common.deadline', { date: formatDate(task.deadline, locale) })}` : ''}
            {task.estimateRating !== null ? ` · ${t('common.feedbackRating', { rating: task.estimateRating })}` : ''}
          </p>
          <button
            type="button"
            onClick={() => setShowWhy((v) => !v)}
            className="mt-1 text-xs font-medium text-slate-400 underline decoration-dotted hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
          >
            {showWhy ? t('common.hideWhy') : t('common.why')}
          </button>
          {showWhy && <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{explainScore(task, t)}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value as TaskStatus)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
          >
            {(Object.entries(statusLabels) as [TaskStatus, string][]).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={() => onDelete(task._id)}
            className="rounded-lg px-2 py-1.5 text-sm font-medium text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            {t('taskItem.delete')}
          </button>
        </div>
      </div>
      {needsFeedback && (
        <TaskFeedbackForm
          estimatedMinutes={task.estimatedMinutes}
          onSubmit={(values) => onFeedback(task._id, values)}
        />
      )}
    </div>
  );
}
