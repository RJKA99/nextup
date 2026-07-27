import { useState, type FormEvent } from 'react';
import type { Task } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

export interface TaskFormValues {
  title: string;
  description: string;
  estimatedMinutes: number;
  relevance: number;
  category: string;
  deadline: string;
  parentTaskId: string;
}

interface TaskFormProps {
  parentOptions: Task[];
  onSubmit: (values: TaskFormValues) => Promise<void>;
}

const EMPTY: TaskFormValues = {
  title: '',
  description: '',
  estimatedMinutes: 30,
  relevance: 3,
  category: '',
  deadline: '',
  parentTaskId: '',
};

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30';

export function TaskForm({ parentOptions, onSubmit }: TaskFormProps) {
  const { t } = useLanguage();
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t('taskForm.heading')}</h2>
      <input
        required
        placeholder={t('taskForm.titlePlaceholder')}
        value={values.title}
        onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
        className={inputClass}
      />
      <textarea
        placeholder={t('taskForm.descriptionPlaceholder')}
        value={values.description}
        onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
        className={`${inputClass} resize-none`}
        rows={2}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          placeholder={t('taskForm.categoryPlaceholder')}
          value={values.category}
          onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
          className={inputClass}
        />
        <select
          value={values.parentTaskId}
          onChange={(e) => setValues((v) => ({ ...v, parentTaskId: e.target.value }))}
          className={inputClass}
        >
          <option value="">{t('taskForm.noParent')}</option>
          {parentOptions.map((task) => (
            <option key={task._id} value={task._id}>
              {t('taskForm.subtaskOf', { title: task.title })}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          {t('taskForm.durationLabel')}
          <input
            type="number"
            min={1}
            required
            value={values.estimatedMinutes}
            onChange={(e) => setValues((v) => ({ ...v, estimatedMinutes: Number(e.target.value) }))}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          {t('taskForm.relevanceLabel')}
          <input
            type="number"
            min={1}
            max={5}
            required
            value={values.relevance}
            onChange={(e) => setValues((v) => ({ ...v, relevance: Number(e.target.value) }))}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          {t('taskForm.deadlineLabel')}
          <input
            type="date"
            value={values.deadline}
            onChange={(e) => setValues((v) => ({ ...v, deadline: e.target.value }))}
            className={inputClass}
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? t('taskForm.submitting') : t('taskForm.submit')}
      </button>
    </form>
  );
}
