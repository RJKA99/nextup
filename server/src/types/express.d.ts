export {};

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      authMethod?: 'jwt' | 'apikey';
      apiKeyId?: string;
    }
  }
}
