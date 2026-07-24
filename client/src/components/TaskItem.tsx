import type { Task, TaskStatus } from '../types';

interface TaskItemProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Tekemättä',
  in_progress: 'Kesken',
  done: 'Valmis',
};

export function TaskItem({ task, onStatusChange, onDelete }: TaskItemProps) {
  return (
    <li className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-3">
      <div className="min-w-0">
        <p className={`font-medium text-slate-900 ${task.status === 'done' ? 'line-through opacity-60' : ''}`}>
          {task.title}
        </p>
        <p className="truncate text-sm text-slate-500">
          {task.estimatedMinutes} min · relevanssi {task.relevance}/5
          {task.deadline ? ` · deadline ${new Date(task.deadline).toLocaleDateString('fi-FI')}` : ''}
          {' · pisteet '}
          {task.score.toFixed(2)}
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
    </li>
  );
}
