import { Router } from 'express';
import { ApiKeyModel } from '../models/ApiKey.js';
import { requireAuth } from '../middleware/auth.js';
import { generateApiKey } from '../utils/apiKey.js';

export const apiKeysRouter = Router();
apiKeysRouter.use(requireAuth);

apiKeysRouter.get('/', async (req, res) => {
  const keys = await ApiKeyModel.find({ userId: req.userId })
    .select('name keyPrefix lastUsedAt createdAt')
    .sort({ createdAt: -1 });
  res.json({ apiKeys: keys });
});

apiKeysRouter.post('/', async (req, res) => {
  const { name } = req.body ?? {};
  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'name is required' });
  }

  const { raw, hash, prefix } = generateApiKey();
  const apiKey = await ApiKeyModel.create({
    userId: req.userId,
    name: name.trim(),
    keyHash: hash,
    keyPrefix: prefix,
  });

  res.status(201).json({
    key: raw,
    apiKey: { id: apiKey._id, name: apiKey.name, keyPrefix: apiKey.keyPrefix, createdAt: apiKey.createdAt },
  });
});

apiKeysRouter.delete('/:id', async (req, res) => {
  const result = await ApiKeyModel.deleteOne({ _id: req.params.id, userId: req.userId });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'API key not found' });
  res.status(204).send();
});
