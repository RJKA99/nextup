import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.js';
import { tasksRouter } from './routes/tasks.js';
import { apiKeysRouter } from './routes/apiKeys.js';
import { mcpRouter } from './routes/mcp.js';
import { getDb } from './db.js';

export const app = express();

app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());

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
app.use('/api/mcp', mcpRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
