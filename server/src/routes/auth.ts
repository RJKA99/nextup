import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { signToken, requireAuth } from '../middleware/auth.js';

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

  const token = signToken(user._id.toString());
  res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
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

  const token = signToken(user._id.toString());
  res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await UserModel.findById(req.userId).select('email name');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: user._id, email: user.email, name: user.name } });
});
