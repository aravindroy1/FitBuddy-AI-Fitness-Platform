import { ChatMessageModel, IChatMessage } from '../models/ChatHistory.js';

export interface IChatRepository {
  getHistory(userId: string, limit?: number): Promise<IChatMessage[]>;
  saveMessage(userId: string, role: 'user' | 'assistant', message: string): Promise<IChatMessage>;
  clearHistory(userId: string): Promise<void>;
}

export class ChatRepository implements IChatRepository {
  async getHistory(userId: string, limit: number = 50): Promise<IChatMessage[]> {
    return ChatMessageModel.find({ userId }).sort({ createdAt: 1 }).limit(limit).exec();
  }

  async saveMessage(userId: string, role: 'user' | 'assistant', message: string): Promise<IChatMessage> {
    const newMessage = new ChatMessageModel({ userId, role, message });
    return newMessage.save();
  }

  async clearHistory(userId: string): Promise<void> {
    await ChatMessageModel.deleteMany({ userId }).exec();
  }
}
