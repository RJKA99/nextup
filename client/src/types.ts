export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskSource = 'user' | 'agent';

export interface Task {
  _id: string;
  parentTaskId: string | null;
  title: string;
  description: string;
  estimatedMinutes: number;
  relevance: number;
  category: string;
  deadline: string | null;
  status: TaskStatus;
  score: number;
  relevanceComponent: number;
  urgencyComponent: number;
  daysUntilDeadline: number | null;
  isOverdue: boolean;
  createdVia: TaskSource;
  actualMinutes: number | null;
  estimateRating: number | null;
  estimateFeedback: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  isDemo: boolean;
}
