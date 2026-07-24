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

export function TaskItem({ task, onStatusChange, onDelete, onFeedback }: TaskItemProps) {
  const needsFeedback = task.status === 'done' && task.createdVia === 'agent' && task.estimateRating === null;

  return (
    <li className="flex flex-col gap-1 rounded-lg border border-slate-200 p-3">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className={`font-medium text-slate-900 ${task.status === 'done' ? 'line-through opacity-60' : ''}`}>
            {task.title}
            {task.createdVia === 'agent' && (
              <span className="ml-2 rounded bg-indigo-100 px-1.5 py-0.5 align-middle text-xs font-normal text-indigo-700 no-underline">
                Agentin luoma
              </span>
            )}
          </p>
          <p className="truncate text-sm text-slate-500">
            {task.estimatedMinutes} min · relevanssi {task.relevance}/5
            {task.deadline ? ` · deadline ${new Date(task.deadline).toLocaleDateString('fi-FI')}` : ''}
            {' · pisteet '}
            {task.score.toFixed(2)}
            {task.estimateRating !== null ? ` · palaute ${task.estimateRating}/5` : ''}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value as TaskStatus)}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button onClick={() => onDelete(task._id)} className="text-sm text-red-600 hover:underline">
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
