import { DietModel, IDiet } from '../models/Diet.js';

export interface IDietRepository {
  findByUserId(userId: string): Promise<IDiet | null>;
  create(diet: Partial<IDiet>): Promise<IDiet>;
  updateByUserId(userId: string, updates: Partial<IDiet>): Promise<IDiet | null>;
}

export class DietRepository implements IDietRepository {
  async findByUserId(userId: string): Promise<IDiet | null> {
    return DietModel.findOne({ userId }).sort({ createdAt: -1 }).exec();
  }

  async create(diet: Partial<IDiet>): Promise<IDiet> {
    const newDiet = new DietModel(diet);
    return newDiet.save();
  }

  async updateByUserId(userId: string, updates: Partial<IDiet>): Promise<IDiet | null> {
    return DietModel.findOneAndUpdate({ userId }, updates, { new: true, upsert: true }).exec();
  }
}
