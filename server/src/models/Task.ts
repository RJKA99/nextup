import { Schema, model, Types, type InferSchemaType } from 'mongoose';

export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

const taskSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    estimatedMinutes: { type: Number, required: true, min: 1 },
    relevance: { type: Number, required: true, min: 1, max: 5 },
    deadline: { type: Date, default: null },
    status: { type: String, enum: TASK_STATUSES, default: 'todo' },
  },
  { timestamps: true }
);

export type Task = InferSchemaType<typeof taskSchema> & { _id: Types.ObjectId };

export const TaskModel = model('Task', taskSchema);
