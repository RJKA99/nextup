import { useState, type FormEvent } from 'react';

export interface TaskFormValues {
  title: string;
  description: string;
  estimatedMinutes: number;
  relevance: number;
  category: string;
  deadline: string;
}

interface TaskFormProps {
  onSubmit: (values: TaskFormValues) => Promise<void>;
}

const EMPTY: TaskFormValues = {
  title: '',
  description: '',
  estimatedMinutes: 30,
  relevance: 3,
  category: '',
  deadline: '',
};

export function TaskForm({ onSubmit }: TaskFormProps) {
  const [values, setValues] = useState<TaskFormValues>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(values);
      setValues(EMPTY);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4">
      <h2 className="font-semibold text-slate-900">Uusi tehtävä</h2>
      <input
        required
        placeholder="Otsikko"
        value={values.title}
        onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
        className="rounded border border-slate-300 px-3 py-2"
      />
      <textarea
        placeholder="Kuvaus (valinnainen)"
        value={values.description}
        onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
        className="rounded border border-slate-300 px-3 py-2"
        rows={2}
      />
      <input
        placeholder="Kategoria (valinnainen, esim. kirjoittaminen)"
        value={values.category}
        onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
        className="rounded border border-slate-300 px-3 py-2"
      />
      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col text-sm text-slate-600">
          Kesto (min)
          <input
            type="number"
            min={1}
            required
            value={values.estimatedMinutes}
            onChange={(e) => setValues((v) => ({ ...v, estimatedMinutes: Number(e.target.value) }))}
            className="rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm text-slate-600">
          Relevanssi (1-5)
          <input
            type="number"
            min={1}
            max={5}
            required
            value={values.relevance}
            onChange={(e) => setValues((v) => ({ ...v, relevance: Number(e.target.value) }))}
            className="rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm text-slate-600">
          Deadline
          <input
            type="date"
            value={values.deadline}
            onChange={(e) => setValues((v) => ({ ...v, deadline: e.target.value }))}
            className="rounded border border-slate-300 px-3 py-2"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {submitting ? 'Lisätään…' : 'Lisää tehtävä'}
      </button>
    </form>
  );
}
