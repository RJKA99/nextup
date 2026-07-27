import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { apiRequest } from './apiClient.js';

interface Task {
  _id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  relevance: number;
  category: string;
  deadline: string | null;
  status: 'todo' | 'in_progress' | 'done';
  score: number;
}

function textResult(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] };
}

const server = new McpServer({ name: 'todo-scheduler', version: '0.1.0' });

server.registerTool(
  'list_tasks',
  {
    title: 'List tasks',
    description:
      "List the user's tasks, ranked by priority score (deadline urgency + relevance). Highest score first.",
    inputSchema: {
      status: z
        .enum(['todo', 'in_progress', 'done'])
        .optional()
        .describe('Optionally filter to a single status'),
    },
  },
  async ({ status }) => {
    const res = await apiRequest<{ tasks: Task[] }>('/tasks');
    const tasks = status ? res.tasks.filter((t) => t.status === status) : res.tasks;
    return textResult(tasks);
  }
);

server.registerTool(
  'get_next_task',
  {
    title: 'Get next task',
    description: "Get the single highest-priority open task the user should work on next.",
    inputSchema: {},
  },
  async () => {
    const res = await apiRequest<{ task: Task | null }>('/tasks/next');
    return textResult(res.task);
  }
);

server.registerTool(
  'create_task',
  {
    title: 'Create task',
    description:
      'Create a new task on the user\'s schedule. Estimate duration and relevance honestly - the user ' +
      'will rate how accurate your estimates were, so calibrated estimates matter more than optimistic ones. ' +
      'Before estimating, call get_estimate_feedback and check for past tasks with a similar category or ' +
      'title - use their actualMinutes vs estimatedMinutes to calibrate this estimate.',
    inputSchema: {
      title: z.string().min(1).describe('Short task title'),
      description: z.string().optional().describe('Optional longer description'),
      estimatedMinutes: z.number().int().positive().describe('Estimated time to complete, in minutes'),
      relevance: z.number().int().min(1).max(5).describe('How relevant/important the task is, 1 (low) to 5 (high)'),
      category: z
        .string()
        .optional()
        .describe(
          'A short label for the kind of work this is (e.g. "writing", "coding", "meeting-prep"). ' +
            'Use a consistent, reusable set of categories across tasks - this is what lets ' +
            'get_estimate_feedback group past accuracy by category so you can calibrate per kind of work.'
        ),
      deadline: z
        .string()
        .optional()
        .describe('ISO 8601 date the task must be done by, e.g. "2026-08-01". Omit if there is no deadline.'),
    },
  },
  async ({ title, description, estimatedMinutes, relevance, category, deadline }) => {
    const res = await apiRequest<{ task: Task }>('/tasks', {
      method: 'POST',
      body: JSON.stringify({ title, description, estimatedMinutes, relevance, category, deadline: deadline ?? null }),
    });
    return textResult(res.task);
  }
);

server.registerTool(
  'update_task_status',
  {
    title: 'Update task status',
    description: "Update a task's status, e.g. to mark it in progress or done.",
    inputSchema: {
      taskId: z.string().describe('The _id of the task to update'),
      status: z.enum(['todo', 'in_progress', 'done']),
    },
  },
  async ({ taskId, status }) => {
    const res = await apiRequest<{ task: Task }>(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return textResult(res.task);
  }
);

server.registerTool(
  'get_estimate_feedback',
  {
    title: 'Get estimate feedback',
    description:
      "Get the user's feedback on past tasks you created: title, category, your estimate " +
      '(estimatedMinutes, relevance) against what actually happened (actualMinutes), the user\'s ' +
      'estimateRating (1-5), and an estimateFeedback comment explaining why the estimate was off ' +
      '(required from the user whenever they rate 3 or lower). Group by category and look for ' +
      'recurring words in the title/comments to figure out what kinds of work you systematically ' +
      'under- or over-estimate.',
    inputSchema: {},
  },
  async () => {
    const res = await apiRequest<{ feedback: unknown[] }>('/tasks/feedback');
    return textResult(res.feedback);
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
