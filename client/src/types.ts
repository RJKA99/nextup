export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  _id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  relevance: number;
  deadline: string | null;
  status: TaskStatus;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}
