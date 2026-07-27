import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';
import { AppHeader } from '../components/AppHeader';
import { TaskForm, type TaskFormValues } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { NextTaskCard } from '../components/NextTaskCard';
import type { FeedbackValues } from '../components/TaskFeedbackForm';
import type { Task, TaskStatus } from '../types';

export function TasksPage() {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nextTask, setNextTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [tasksRes, nextRes] = await Promise.all([
        apiFetch<{ tasks: Task[] }>('/tasks'),
        apiFetch<{ task: Task | null }>('/tasks/next'),
      ]);
      setTasks(tasksRes.tasks);
      setNextTask(nextRes.task);
    } catch {
      setError(t('tasks.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleCreate(values: TaskFormValues) {
    await apiFetch('/tasks', {
      method: 'POST',
      body: JSON.stringify({ ...values, deadline: values.deadline || null }),
    });
    await refresh();
  }

  async function handleStatusChange(id: string, status: TaskStatus) {
    await apiFetch(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await refresh();
  }

  async function handleDelete(id: string) {
    await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
    await refresh();
  }

  async function handleFeedback(id: string, values: FeedbackValues) {
    await apiFetch(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(values) });
    await refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AppHeader active="tasks" />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <NextTaskCard task={nextTask} />
        </div>

        <div className="mb-8">
          <TaskForm parentOptions={tasks.filter((task) => !task.parentTaskId)} onSubmit={handleCreate} />
        </div>

        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('tasks.allTasks')}</h2>
        {loading && <p className="text-slate-500 dark:text-slate-400">{t('tasks.loading')}</p>}
        {error && <p className="text-rose-600 dark:text-rose-400">{error}</p>}
        {!loading && !error && (
          <TaskList
            tasks={tasks}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onFeedback={handleFeedback}
          />
        )}
      </main>
    </div>
  );
}
