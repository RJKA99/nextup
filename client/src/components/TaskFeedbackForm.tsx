import { useState, type FormEvent } from 'react';

export interface FeedbackValues {
  actualMinutes?: number;
  estimateRating: number;
  estimateFeedback?: string;
}

interface TaskFeedbackFormProps {
  estimatedMinutes: number;
  onSubmit: (values: FeedbackValues) => Promise<void>;
}

export function TaskFeedbackForm({ estimatedMinutes, onSubmit }: TaskFeedbackFormProps) {
  const [actualMinutes, setActualMinutes] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const commentRequired = rating > 0 && rating <= 3;
  const canSubmit = rating >= 1 && (!commentRequired || comment.trim().length > 0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({
        actualMinutes: actualMinutes ? Number(actualMinutes) : undefined,
        estimateRating: rating,
        estimateFeedback: comment.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-1 flex flex-col gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5"
    >
      <p className="text-sm font-medium text-slate-700">
        Agentti arvioi tämän kestävän {estimatedMinutes} min. Kuinka hyvin arvio (kesto + relevanssi) osui?
      </p>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition ${
              rating >= n ? 'bg-amber-400 text-amber-950' : 'bg-white text-slate-400 shadow-sm hover:bg-slate-100'
            }`}
            aria-label={`${n} tähteä`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="number"
          min={1}
          placeholder="Todellinen kesto (min, valinnainen)"
          value={actualMinutes}
          onChange={(e) => setActualMinutes(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:w-56"
        />
        <input
          type="text"
          required={commentRequired}
          placeholder={commentRequired ? 'Miksi arvio ei osunut? (pakollinen alle 4 tähdellä)' : 'Kommentti (valinnainen)'}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className={`flex-1 rounded-lg border bg-white px-3 py-1.5 text-sm shadow-sm transition focus:outline-none focus:ring-2 ${
            commentRequired
              ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-500/30'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/30'
          }`}
        />
      </div>
      <button
        type="submit"
        disabled={submitting || !canSubmit}
        className="self-start rounded-lg bg-slate-900 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? 'Lähetetään…' : 'Lähetä palaute'}
      </button>
    </form>
  );
}
