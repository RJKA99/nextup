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
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2 rounded border border-dashed border-slate-300 bg-slate-50 p-3">
      <p className="text-sm font-medium text-slate-700">
        Agentti arvioi tämän kestävän {estimatedMinutes} min. Kuinka hyvin arvio (kesto + relevanssi) osui?
      </p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`h-8 w-8 rounded ${rating >= n ? 'bg-amber-400' : 'bg-slate-200'}`}
            aria-label={`${n} tähteä`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          min={1}
          placeholder="Todellinen kesto (min, valinnainen)"
          value={actualMinutes}
          onChange={(e) => setActualMinutes(e.target.value)}
          className="w-56 rounded border border-slate-300 px-2 py-1 text-sm"
        />
        <input
          type="text"
          required={commentRequired}
          placeholder={commentRequired ? 'Miksi arvio ei osunut? (pakollinen alle 4 tähdellä)' : 'Kommentti (valinnainen)'}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className={`flex-1 rounded border px-2 py-1 text-sm ${commentRequired ? 'border-amber-500' : 'border-slate-300'}`}
        />
      </div>
      <button
        type="submit"
        disabled={submitting || !canSubmit}
        className="self-start rounded bg-slate-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {submitting ? 'Lähetetään…' : 'Lähetä palaute'}
      </button>
    </form>
  );
}
