import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
  userId: string;
  role: 'user' | 'assistant';
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    message: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

export const ChatMessageModel = mongoose.model<IChatMessage>('ChatHistory', ChatMessageSchema);
