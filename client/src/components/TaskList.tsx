import type { Task, TaskStatus } from '../types';
import { TaskItem } from './TaskItem';
import type { FeedbackValues } from './TaskFeedbackForm';
import { useLanguage } from '../i18n/LanguageContext';

interface TaskListProps {
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onFeedback: (id: string, values: FeedbackValues) => Promise<void>;
}

export function TaskList({ tasks, onStatusChange, onDelete, onFeedback }: TaskListProps) {
  const { t } = useLanguage();

  if (tasks.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
        {t('taskList.empty')}
      </p>
    );
  }

  const topLevel = tasks.filter((task) => !task.parentTaskId);
  const childrenByParent = new Map<string, Task[]>();
  for (const task of tasks) {
    if (task.parentTaskId) {
      const siblings = childrenByParent.get(task.parentTaskId) ?? [];
      siblings.push(task);
      childrenByParent.set(task.parentTaskId, siblings);
    }
  }

  return (
    <ul className="flex flex-col gap-2">
      {topLevel.map((task) => (
        <li key={task._id} className="list-none">
          <div className="flex flex-col gap-2">
            <TaskItem task={task} onStatusChange={onStatusChange} onDelete={onDelete} onFeedback={onFeedback} />
            {(childrenByParent.get(task._id) ?? []).map((child) => (
              <div key={child._id} className="ml-6">
                <TaskItem
                  task={child}
                  isSubtask
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                  onFeedback={onFeedback}
                />
              </div>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
