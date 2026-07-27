import { Types } from 'mongoose';
import { TaskModel, TASK_STATUSES, type Task } from '../models/Task.js';
import { rankTasks } from '../utils/priority.js';

export type ServiceResult<T> = { ok: true; value: T } | { ok: false; status: number; error: string };

function ok<T>(value: T): { ok: true; value: T } {
  return { ok: true, value };
}

function fail(status: number, error: string): { ok: false; status: number; error: string } {
  return { ok: false, status, error };
}

interface ParsedTaskInput {
  title: string;
  description: string;
  estimatedMinutes: number;
  relevance: number;
  category: string;
  deadline: Date | null;
  parentTaskId: Types.ObjectId | null;
}

async function parseTaskInput(userId: string, body: Record<string, unknown>): Promise<ServiceResult<ParsedTaskInput>> {
  const { title, description, estimatedMinutes, relevance, category, deadline, parentTaskId } = body;

  if (typeof title !== 'string' || title.trim().length === 0) {
    return fail(400, 'title is required');
  }
  const minutes = Number(estimatedMinutes);
  if (!Number.isFinite(minutes) || minutes < 1) {
    return fail(400, 'estimatedMinutes must be a positive number');
  }
  const relevanceNum = Number(relevance);
  if (!Number.isFinite(relevanceNum) || relevanceNum < 1 || relevanceNum > 5) {
    return fail(400, 'relevance must be a number between 1 and 5');
  }

  let deadlineDate: Date | null = null;
  if (deadline) {
    const parsed = new Date(deadline as string);
    if (Number.isNaN(parsed.getTime())) {
      return fail(400, 'deadline must be a valid date');
    }
    deadlineDate = parsed;
  }

  let parentId: Types.ObjectId | null = null;
  if (parentTaskId) {
    if (typeof parentTaskId !== 'string' || !Types.ObjectId.isValid(parentTaskId)) {
      return fail(400, 'parentTaskId must be a valid task id');
    }
    const parentExists = await TaskModel.exists({ _id: parentTaskId, userId });
    if (!parentExists) {
      return fail(400, 'parentTaskId must reference an existing task of yours');
    }
    parentId = new Types.ObjectId(parentTaskId);
  }

  return ok({
    title: title.trim(),
    description: typeof description === 'string' ? description.trim() : '',
    estimatedMinutes: minutes,
    relevance: relevanceNum,
    category: typeof category === 'string' ? category.trim() : '',
    deadline: deadlineDate,
    parentTaskId: parentId,
  });
}

export async function listRankedTasks(userId: string) {
  const tasks = await TaskModel.find({ userId }).lean();
  return rankTasks(tasks);
}

export async function getNextTask(userId: string) {
  const tasks = await TaskModel.find({ userId, status: { $ne: 'done' } }).lean();
  const [top] = rankTasks(tasks);
  return top ?? null;
}

export async function getFeedbackHistory(userId: string) {
  return TaskModel.find({ userId, createdVia: 'agent', estimateRating: { $ne: null } })
    .select('title category estimatedMinutes actualMinutes relevance estimateRating estimateFeedback createdAt')
    .sort({ updatedAt: -1 })
    .lean();
}

export async function createTask(
  userId: string,
  input: Record<string, unknown>,
  authMethod: 'jwt' | 'apikey' | undefined,
  apiKeyId: string | undefined
): Promise<ServiceResult<Task>> {
  const parsed = await parseTaskInput(userId, input);
  if (!parsed.ok) return parsed;

  const task = await TaskModel.create({
    ...parsed.value,
    userId,
    createdVia: authMethod === 'apikey' ? 'agent' : 'user',
    createdByApiKeyId: authMethod === 'apikey' ? apiKeyId : null,
  });
  return ok(task);
}

export async function updateTask(
  userId: string,
  taskId: string,
  patch: Record<string, unknown>
): Promise<ServiceResult<Task>> {
  const task = await TaskModel.findOne({ _id: taskId, userId });
  if (!task) return fail(404, 'Task not found');

  const {
    title,
    description,
    estimatedMinutes,
    relevance,
    category,
    deadline,
    status,
    actualMinutes,
    estimateRating,
    estimateFeedback,
  } = patch;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return fail(400, 'title must be a non-empty string');
    }
    task.title = title.trim();
  }
  if (description !== undefined) task.description = String(description);
  if (estimatedMinutes !== undefined) {
    const minutes = Number(estimatedMinutes);
    if (!Number.isFinite(minutes) || minutes < 1) {
      return fail(400, 'estimatedMinutes must be a positive number');
    }
    task.estimatedMinutes = minutes;
  }
  if (relevance !== undefined) {
    const relevanceNum = Number(relevance);
    if (!Number.isFinite(relevanceNum) || relevanceNum < 1 || relevanceNum > 5) {
      return fail(400, 'relevance must be a number between 1 and 5');
    }
    task.relevance = relevanceNum;
  }
  if (category !== undefined) task.category = String(category).trim();
  if (deadline !== undefined) {
    if (deadline === null) {
      task.deadline = null;
    } else {
      const parsed = new Date(deadline as string);
      if (Number.isNaN(parsed.getTime())) {
        return fail(400, 'deadline must be a valid date');
      }
      task.deadline = parsed;
    }
  }
  if (status !== undefined) {
    if (!TASK_STATUSES.includes(status as (typeof TASK_STATUSES)[number])) {
      return fail(400, `status must be one of ${TASK_STATUSES.join(', ')}`);
    }
    task.status = status as (typeof TASK_STATUSES)[number];
  }
  if (actualMinutes !== undefined) {
    const minutes = Number(actualMinutes);
    if (!Number.isFinite(minutes) || minutes < 1) {
      return fail(400, 'actualMinutes must be a positive number');
    }
    task.actualMinutes = minutes;
  }
  if (estimateRating !== undefined) {
    const rating = Number(estimateRating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return fail(400, 'estimateRating must be a number between 1 and 5');
    }
    task.estimateRating = rating;
  }
  if (estimateFeedback !== undefined) task.estimateFeedback = String(estimateFeedback);

  if (task.estimateRating !== null && task.estimateRating !== undefined && task.estimateRating <= 3 && !task.estimateFeedback) {
    return fail(400, 'estimateFeedback is required when estimateRating is 3 or lower, so agents learn why');
  }

  await task.save();
  return ok(task);
}

export async function deleteTask(userId: string, taskId: string): Promise<boolean> {
  const result = await TaskModel.deleteOne({ _id: taskId, userId });
  return result.deletedCount > 0;
}
