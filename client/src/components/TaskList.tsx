import type { Task, TaskStatus } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

export function TaskList({ tasks, onStatusChange, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="text-slate-500">Ei vielä tehtäviä. Lisää ensimmäinen yllä.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskItem key={task._id} task={task} onStatusChange={onStatusChange} onDelete={onDelete} />
      ))}
    </ul>
  );
}
