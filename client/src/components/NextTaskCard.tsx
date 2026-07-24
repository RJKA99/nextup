import type { Task } from '../types';

interface NextTaskCardProps {
  task: Task | null;
}

export function NextTaskCard({ task }: NextTaskCardProps) {
  return (
    <div className="rounded-lg border-2 border-slate-900 bg-slate-50 p-4">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Tee tämä seuraavaksi</p>
      {task ? (
        <>
          <p className="mt-1 text-lg font-semibold text-slate-900">{task.title}</p>
          <p className="text-sm text-slate-600">
            {task.estimatedMinutes} min · relevanssi {task.relevance}/5
            {task.deadline ? ` · deadline ${new Date(task.deadline).toLocaleDateString('fi-FI')}` : ''}
          </p>
        </>
      ) : (
        <p className="mt-1 text-slate-500">Ei avoimia tehtäviä — hyvää työtä!</p>
      )}
    </div>
  );
}
