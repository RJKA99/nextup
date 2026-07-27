import type { Task } from '../types';

type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

export function explainScore(task: Task, t: TranslateFn): string {
  const relevancePart = t('explain.relevancePart', {
    relevance: task.relevance,
    value: task.relevanceComponent.toFixed(2),
  });

  let urgencyPart: string;
  if (task.daysUntilDeadline === null) {
    urgencyPart = t('explain.noDeadline', { value: task.urgencyComponent.toFixed(2) });
  } else if (task.isOverdue) {
    urgencyPart = t('explain.overdue', { value: task.urgencyComponent.toFixed(2) });
  } else {
    urgencyPart = t('explain.daysLeft', {
      days: Math.round(task.daysUntilDeadline),
      value: task.urgencyComponent.toFixed(2),
    });
  }

  return `${relevancePart}, ${t('explain.and')} ${urgencyPart}. ${t('explain.total', { score: task.score.toFixed(2) })}`;
}
