import type { Task, TaskStatus } from '../types';
import { TaskFeedbackForm, type FeedbackValues } from './TaskFeedbackForm';

interface TaskItemProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onFeedback: (id: string, values: FeedbackValues) => Promise<void>;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Tekemättä',
  in_progress: 'Kesken',
  done: 'Valmis',
};

function scoreBadgeClass(score: number): string {
  if (score >= 0.7) return 'bg-rose-100 text-rose-700';
  if (score >= 0.4) return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-600';
}

export function TaskItem({ task, onStatusChange, onDelete, onFeedback }: TaskItemProps) {
  const needsFeedback = task.status === 'done' && task.createdVia === 'agent' && task.estimateRating === null;

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className={`font-semibold text-slate-900 ${task.status === 'done' ? 'line-through opacity-50' : ''}`}>
              {task.title}
            </p>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${scoreBadgeClass(task.score)}`}>
              {task.score.toFixed(2)}
            </span>
            {task.createdVia === 'agent' && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                Agentin luoma
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-sm text-slate-500">
            {task.category ? `${task.category} · ` : ''}
            {task.estimatedMinutes} min · relevanssi {task.relevance}/5
            {task.deadline ? ` · deadline ${new Date(task.deadline).toLocaleDateString('fi-FI')}` : ''}
            {task.estimateRating !== null ? ` · palaute ${task.estimateRating}/5` : ''}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value as TaskStatus)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={() => onDelete(task._id)}
            className="rounded-lg px-2 py-1.5 text-sm font-medium text-rose-500 transition hover:bg-rose-50"
          >
            Poista
          </button>
        </div>
      </div>
      {needsFeedback && (
        <TaskFeedbackForm
          estimatedMinutes={task.estimatedMinutes}
          onSubmit={(values) => onFeedback(task._id, values)}
        />
      )}
    </li>
  );
}
