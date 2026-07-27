import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as taskService from '../services/taskService.js';

function textResult(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] };
}

function errorResult(message: string) {
  return { content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }], isError: true };
}

/**
 * Builds a fresh McpServer bound to one authenticated user, calling the task
 * service directly (no HTTP round-trip to this same process). Used by the
 * remote Streamable HTTP transport, which creates one per request since
 * Vercel functions are stateless.
 */
export function createMcpServer(
  userId: string,
  authMethod: 'jwt' | 'apikey' | undefined,
  apiKeyId: string | undefined
): McpServer {
  const server = new McpServer({ name: 'nextup', version: '0.2.0' });

  server.registerTool(
    'list_tasks',
    {
      title: 'List tasks',
      description:
        "List the user's tasks, ranked by priority score (deadline urgency + relevance). Highest score " +
        'first. Each task includes a score breakdown (relevanceComponent, urgencyComponent, ' +
        'daysUntilDeadline) explaining why it ranked where it did, and parentTaskId if it is a subtask.',
      inputSchema: {
        status: z.enum(['todo', 'in_progress', 'done']).optional().describe('Optionally filter to a single status'),
      },
    },
    async ({ status }) => {
      const tasks = await taskService.listRankedTasks(userId);
      return textResult(status ? tasks.filter((t) => t.status === status) : tasks);
    }
  );

  server.registerTool(
    'get_next_task',
    {
      title: 'Get next task',
      description:
        'Get the single highest-priority open task the user should work on next, with a score breakdown ' +
        'explaining why (relevanceComponent + urgencyComponent = score).',
      inputSchema: {},
    },
    async () => textResult(await taskService.getNextTask(userId))
  );

  server.registerTool(
    'create_task',
    {
      title: 'Create task',
      description:
        'Create a new task, or a subtask of an existing one via parentTaskId - use this to split a large ' +
        'task into smaller, better-estimated pieces instead of one big uncertain estimate. Estimate ' +
        'duration and relevance honestly: the user rates your estimates, so calibrated numbers matter ' +
        'more than optimistic ones. Call get_estimate_feedback first and check for similar past tasks ' +
        '(by category or title) to calibrate this one.',
      inputSchema: {
        title: z.string().min(1).describe('Short task title'),
        description: z.string().optional().describe('Optional longer description'),
        estimatedMinutes: z.number().int().positive().describe('Estimated time to complete, in minutes'),
        relevance: z.number().int().min(1).max(5).describe('How relevant/important the task is, 1 (low) to 5 (high)'),
        category: z
          .string()
          .optional()
          .describe(
            'A short, reusable label for the kind of work (e.g. "writing", "coding"). Lets ' +
              'get_estimate_feedback group past accuracy by category.'
          ),
        deadline: z
          .string()
          .optional()
          .describe('ISO 8601 date the task must be done by, e.g. "2026-08-01". Omit if there is no deadline.'),
        parentTaskId: z
          .string()
          .optional()
          .describe('The _id of an existing task to attach this as a subtask of, when splitting up bigger work.'),
      },
    },
    async ({ title, description, estimatedMinutes, relevance, category, deadline, parentTaskId }) => {
      const result = await taskService.createTask(
        userId,
        { title, description, estimatedMinutes, relevance, category, deadline: deadline ?? null, parentTaskId },
        authMethod,
        apiKeyId
      );
      if (!result.ok) return errorResult(result.error);
      return textResult(result.value);
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
      const result = await taskService.updateTask(userId, taskId, { status });
      if (!result.ok) return errorResult(result.error);
      return textResult(result.value);
    }
  );

  server.registerTool(
    'get_estimate_feedback',
    {
      title: 'Get estimate feedback',
      description:
        "Get the user's feedback on past tasks you created: title, category, your estimate " +
        "(estimatedMinutes, relevance) against what actually happened (actualMinutes), the user's " +
        'estimateRating (1-5), and an estimateFeedback comment explaining why the estimate was off ' +
        '(required from the user whenever they rate 3 or lower). Group by category and look for ' +
        'recurring words in the title/comments to figure out what kinds of work you systematically ' +
        'under- or over-estimate.',
      inputSchema: {},
    },
    async () => textResult(await taskService.getFeedbackHistory(userId))
  );

  return server;
}
