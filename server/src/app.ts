import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { tasksRouter } from './routes/tasks.js';
import { apiKeysRouter } from './routes/apiKeys.js';
import { getDb } from './db.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.use(async (_req, _res, next) => {
  try {
    await getDb();
    next();
  } catch (err) {
    next(err);
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/api-keys', apiKeysRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
