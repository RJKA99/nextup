import type { Request, Response } from 'express';

export const AUTH_COOKIE_NAME = 'token';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function setAuthCookie(req: Request, res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: req.secure,
    sameSite: 'lax',
    maxAge: THIRTY_DAYS_MS,
    path: '/',
  });
}

export function clearAuthCookie(req: Request, res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: req.secure,
    sameSite: 'lax',
    path: '/',
  });
}
