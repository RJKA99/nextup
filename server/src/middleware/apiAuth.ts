import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ApiKeyModel } from '../models/ApiKey.js';
import { hashApiKey, looksLikeApiKey } from '../utils/apiKey.js';
import { AUTH_COOKIE_NAME } from '../utils/cookies.js';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const bearerToken = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;

  if (bearerToken && looksLikeApiKey(bearerToken)) {
    const keyDoc = await ApiKeyModel.findOne({ keyHash: hashApiKey(bearerToken) });
    if (!keyDoc) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    keyDoc.lastUsedAt = new Date();
    await keyDoc.save();
    req.userId = keyDoc.userId.toString();
    req.authMethod = 'apikey';
    req.apiKeyId = keyDoc._id.toString();
    return next();
  }

  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  if (!cookieToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const payload = jwt.verify(cookieToken, getJwtSecret()) as jwt.JwtPayload;
    req.userId = payload.sub as string;
    req.authMethod = 'jwt';
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}
