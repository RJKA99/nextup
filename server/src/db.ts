import mongoose from 'mongoose';

let connectPromise: Promise<typeof mongoose> | null = null;

export function getDb(): Promise<typeof mongoose> {
  if (!connectPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not set');
    }
    connectPromise = mongoose.connect(uri);
  }
  return connectPromise;
}
