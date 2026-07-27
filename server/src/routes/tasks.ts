import { Router } from 'express';
import { authenticate } from '../middleware/apiAuth.js';
import * as taskService from '../services/taskService.js';

export const tasksRouter = Router();
tasksRouter.use(authenticate);

tasksRouter.get('/', async (req, res) => {
  const tasks = await taskService.listRankedTasks(req.userId!);
  res.json({ tasks });
});

tasksRouter.get('/feedback', async (req, res) => {
  const feedback = await taskService.getFeedbackHistory(req.userId!);
  res.json({ feedback });
});

tasksRouter.get('/next', async (req, res) => {
  const task = await taskService.getNextTask(req.userId!);
  res.json({ task });
});

tasksRouter.post('/', async (req, res) => {
  const result = await taskService.createTask(req.userId!, req.body ?? {}, req.authMethod, req.apiKeyId);
  if (!result.ok) return res.status(result.status).json({ error: result.error });
  res.status(201).json({ task: result.value });
});

tasksRouter.patch('/:id', async (req, res) => {
  const result = await taskService.updateTask(req.userId!, req.params.id, req.body ?? {});
  if (!result.ok) return res.status(result.status).json({ error: result.error });
  res.json({ task: result.value });
});

tasksRouter.delete('/:id', async (req, res) => {
  const deleted = await taskService.deleteTask(req.userId!, req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Task not found' });
  res.status(204).send();
});
