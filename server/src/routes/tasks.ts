import { Router } from 'express';
import { TaskModel, TASK_STATUSES } from '../models/Task.js';
import { authenticate } from '../middleware/apiAuth.js';
import { rankTasks } from '../utils/priority.js';

export const tasksRouter = Router();
tasksRouter.use(authenticate);

function parseTaskInput(body: unknown) {
  const { title, description, estimatedMinutes, relevance, deadline } = (body ?? {}) as Record<string, unknown>;

  if (typeof title !== 'string' || title.trim().length === 0) {
    return { error: 'title is required' } as const;
  }
  const minutes = Number(estimatedMinutes);
  if (!Number.isFinite(minutes) || minutes < 1) {
    return { error: 'estimatedMinutes must be a positive number' } as const;
  }
  const relevanceNum = Number(relevance);
  if (!Number.isFinite(relevanceNum) || relevanceNum < 1 || relevanceNum > 5) {
    return { error: 'relevance must be a number between 1 and 5' } as const;
  }
  let deadlineDate: Date | null = null;
  if (deadline) {
    const parsed = new Date(deadline as string);
    if (Number.isNaN(parsed.getTime())) {
      return { error: 'deadline must be a valid date' } as const;
    }
    deadlineDate = parsed;
  }

  return {
    value: {
      title: title.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      estimatedMinutes: minutes,
      relevance: relevanceNum,
      deadline: deadlineDate,
    },
  } as const;
}

tasksRouter.get('/', async (req, res) => {
  const tasks = await TaskModel.find({ userId: req.userId }).lean();
  const ranked = rankTasks(tasks);
  res.json({ tasks: ranked });
});

tasksRouter.get('/next', async (req, res) => {
  const tasks = await TaskModel.find({ userId: req.userId, status: { $ne: 'done' } }).lean();
  const [top] = rankTasks(tasks);
  res.json({ task: top ?? null });
});

tasksRouter.post('/', async (req, res) => {
  const parsed = parseTaskInput(req.body);
  if ('error' in parsed) return res.status(400).json({ error: parsed.error });

  const task = await TaskModel.create({ ...parsed.value, userId: req.userId });
  res.status(201).json({ task });
});

tasksRouter.patch('/:id', async (req, res) => {
  const task = await TaskModel.findOne({ _id: req.params.id, userId: req.userId });
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { title, description, estimatedMinutes, relevance, deadline, status } = req.body ?? {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'title must be a non-empty string' });
    }
    task.title = title.trim();
  }
  if (description !== undefined) task.description = String(description);
  if (estimatedMinutes !== undefined) {
    const minutes = Number(estimatedMinutes);
    if (!Number.isFinite(minutes) || minutes < 1) {
      return res.status(400).json({ error: 'estimatedMinutes must be a positive number' });
    }
    task.estimatedMinutes = minutes;
  }
  if (relevance !== undefined) {
    const relevanceNum = Number(relevance);
    if (!Number.isFinite(relevanceNum) || relevanceNum < 1 || relevanceNum > 5) {
      return res.status(400).json({ error: 'relevance must be a number between 1 and 5' });
    }
    task.relevance = relevanceNum;
  }
  if (deadline !== undefined) {
    if (deadline === null) {
      task.deadline = null;
    } else {
      const parsed = new Date(deadline);
      if (Number.isNaN(parsed.getTime())) {
        return res.status(400).json({ error: 'deadline must be a valid date' });
      }
      task.deadline = parsed;
    }
  }
  if (status !== undefined) {
    if (!TASK_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of ${TASK_STATUSES.join(', ')}` });
    }
    task.status = status;
  }

  await task.save();
  res.json({ task });
});

tasksRouter.delete('/:id', async (req, res) => {
  const result = await TaskModel.deleteOne({ _id: req.params.id, userId: req.userId });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Task not found' });
  res.status(204).send();
});
