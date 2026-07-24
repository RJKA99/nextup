import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { TaskForm, type TaskFormValues } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { NextTaskCard } from '../components/NextTaskCard';
import type { Task, TaskStatus } from '../types';

export function TasksPage() {
  const { user, logout } = useAuth();
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
      setError('Tehtävien lataus epäonnistui');
    } finally {
      setLoading(false);
    }
  }, []);

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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Todo Scheduler</h1>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>{user?.email}</span>
          <button onClick={logout} className="underline">
            Kirjaudu ulos
          </button>
        </div>
      </div>

      <div className="mb-6">
        <NextTaskCard task={nextTask} />
      </div>

      <div className="mb-6">
        <TaskForm onSubmit={handleCreate} />
      </div>

      {loading && <p className="text-slate-500">Ladataan…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <TaskList tasks={tasks} onStatusChange={handleStatusChange} onDelete={handleDelete} />
      )}
    </div>
  );
}
