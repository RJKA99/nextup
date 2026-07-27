import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { UserModel } from '../models/User.js';
import { TaskModel } from '../models/Task.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { setAuthCookie, clearAuthCookie } from '../utils/cookies.js';
import { buildDemoTasks } from '../utils/demoData.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const { email, password, name } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'email and password (min 8 chars) are required' });
  }

  const existing = await UserModel.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ email: email.toLowerCase(), passwordHash, name });

  setAuthCookie(req, res, signToken(user._id.toString()));
  res.status(201).json({ user: { id: user._id, email: user.email, name: user.name, isDemo: false } });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  setAuthCookie(req, res, signToken(user._id.toString()));
  res.json({ user: { id: user._id, email: user.email, name: user.name, isDemo: user.isDemo } });
});

authRouter.post('/demo', async (req, res) => {
  const email = `demo-${Date.now()}-${randomBytes(4).toString('hex')}@todo-scheduler.demo`;
  const passwordHash = await bcrypt.hash(randomBytes(24).toString('hex'), 10);
  const user = await UserModel.create({ email, passwordHash, name: 'Demo-käyttäjä', isDemo: true });

  await TaskModel.insertMany(buildDemoTasks(user._id));

  setAuthCookie(req, res, signToken(user._id.toString()));
  res.status(201).json({ user: { id: user._id, email: user.email, name: user.name, isDemo: true } });
});

authRouter.post('/logout', (req, res) => {
  clearAuthCookie(req, res);
  res.status(204).send();
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await UserModel.findById(req.userId).select('email name isDemo');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: user._id, email: user.email, name: user.name, isDemo: user.isDemo } });
});
