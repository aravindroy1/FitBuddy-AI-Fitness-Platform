import { WorkoutModel, IWorkout } from '../models/Workout.js';

export interface IWorkoutRepository {
  findByUserId(userId: string): Promise<IWorkout | null>;
  create(workout: Partial<IWorkout>): Promise<IWorkout>;
  updateByUserId(userId: string, updates: Partial<IWorkout>): Promise<IWorkout | null>;
}

export class WorkoutRepository implements IWorkoutRepository {
  async findByUserId(userId: string): Promise<IWorkout | null> {
    return WorkoutModel.findOne({ userId }).sort({ createdAt: -1 }).exec();
  }

  async create(workout: Partial<IWorkout>): Promise<IWorkout> {
    const newWorkout = new WorkoutModel(workout);
    return newWorkout.save();
  }

  async updateByUserId(userId: string, updates: Partial<IWorkout>): Promise<IWorkout | null> {
    return WorkoutModel.findOneAndUpdate({ userId }, updates, { new: true, upsert: true }).exec();
  }
}
