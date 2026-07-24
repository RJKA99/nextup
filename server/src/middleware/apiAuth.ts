import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ApiKeyModel } from '../models/ApiKey.js';
import { hashApiKey, looksLikeApiKey } from '../utils/apiKey.js';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  if (looksLikeApiKey(token)) {
    const keyDoc = await ApiKeyModel.findOne({ keyHash: hashApiKey(token) });
    if (!keyDoc) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    keyDoc.lastUsedAt = new Date();
    await keyDoc.save();
    req.userId = keyDoc.userId.toString();
    return next();
  }

  try {
    const payload = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload;
    req.userId = payload.sub as string;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
