import { randomBytes, createHash } from 'crypto';

const KEY_PREFIX = 'tsk_';

export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const raw = KEY_PREFIX + randomBytes(24).toString('hex');
  return { raw, hash: hashApiKey(raw), prefix: raw.slice(0, 12) };
}

export function hashApiKey(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export function looksLikeApiKey(token: string): boolean {
  return token.startsWith(KEY_PREFIX);
}
