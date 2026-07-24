import type { Task, TaskStatus } from '../types';
import { TaskItem } from './TaskItem';
import type { FeedbackValues } from './TaskFeedbackForm';

interface TaskListProps {
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onFeedback: (id: string, values: FeedbackValues) => Promise<void>;
}

export function TaskList({ tasks, onStatusChange, onDelete, onFeedback }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="text-slate-500">Ei vielä tehtäviä. Lisää ensimmäinen yllä.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          onFeedback={onFeedback}
        />
      ))}
    </ul>
  );
}
