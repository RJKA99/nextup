import { Schema, model, Types, type InferSchemaType } from 'mongoose';

const apiKeySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    keyHash: { type: String, required: true, unique: true },
    keyPrefix: { type: String, required: true },
    lastUsedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type ApiKey = InferSchemaType<typeof apiKeySchema> & { _id: Types.ObjectId };

export const ApiKeyModel = model('ApiKey', apiKeySchema);
