import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: '30d' });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }
  try {
    const payload = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload;
    req.userId = payload.sub as string;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
