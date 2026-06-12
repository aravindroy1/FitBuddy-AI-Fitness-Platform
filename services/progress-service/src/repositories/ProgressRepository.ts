import { ProgressModel, IProgress } from '../models/Progress.js';

export interface IProgressRepository {
  getHistory(userId: string): Promise<IProgress[]>;
  create(progress: Partial<IProgress>): Promise<IProgress>;
}

export class ProgressRepository implements IProgressRepository {
  async getHistory(userId: string): Promise<IProgress[]> {
    return ProgressModel.find({ userId }).sort({ createdAt: 1 }).exec();
  }

  async create(progress: Partial<IProgress>): Promise<IProgress> {
    const newProgress = new ProgressModel(progress);
    return newProgress.save();
  }
}
