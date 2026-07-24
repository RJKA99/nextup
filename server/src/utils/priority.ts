import type { Task } from '../models/Task.js';

const RELEVANCE_WEIGHT = 0.5;
const URGENCY_WEIGHT = 0.5;
const URGENCY_HORIZON_DAYS = 14;

/**
 * Urgency saturates to 1 for overdue/due-now tasks and decays linearly
 * to 0 as the deadline moves beyond URGENCY_HORIZON_DAYS away.
 * Tasks without a deadline get a low constant urgency so they don't
 * drown out deadline-bound work but still surface eventually.
 */
function urgencyOf(deadline: Date | null | undefined, now: Date): number {
  if (!deadline) return 0.15;
  const daysLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (daysLeft <= 0) return 1;
  return Math.max(0, 1 - daysLeft / URGENCY_HORIZON_DAYS);
}

export function priorityScore(task: Pick<Task, 'relevance' | 'deadline'>, now: Date = new Date()): number {
  const relevanceScore = task.relevance / 5;
  const urgency = urgencyOf(task.deadline ?? null, now);
  return RELEVANCE_WEIGHT * relevanceScore + URGENCY_WEIGHT * urgency;
}

export function rankTasks<T extends Pick<Task, 'relevance' | 'deadline' | 'estimatedMinutes'>>(
  tasks: T[],
  now: Date = new Date()
): (T & { score: number })[] {
  return tasks
    .map((task) => ({ ...task, score: priorityScore(task, now) }))
    .sort((a, b) => b.score - a.score || a.estimatedMinutes - b.estimatedMinutes);
}
