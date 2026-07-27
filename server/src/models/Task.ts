import { Schema, model, Types, type InferSchemaType } from 'mongoose';

export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_SOURCES = ['user', 'agent'] as const;
export type TaskSource = (typeof TASK_SOURCES)[number];

const taskSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    parentTaskId: { type: Schema.Types.ObjectId, ref: 'Task', default: null, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    estimatedMinutes: { type: Number, required: true, min: 1 },
    relevance: { type: Number, required: true, min: 1, max: 5 },
    category: { type: String, trim: true, default: '' },
    deadline: { type: Date, default: null },
    status: { type: String, enum: TASK_STATUSES, default: 'todo' },
    createdVia: { type: String, enum: TASK_SOURCES, default: 'user' },
    createdByApiKeyId: { type: Schema.Types.ObjectId, ref: 'ApiKey', default: null },
    actualMinutes: { type: Number, min: 1, default: null },
    estimateRating: { type: Number, min: 1, max: 5, default: null },
    estimateFeedback: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export type Task = InferSchemaType<typeof taskSchema> & { _id: Types.ObjectId };

export const TaskModel = model('Task', taskSchema);
