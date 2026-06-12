import { ProgressRepository } from '../repositories/ProgressRepository.js';
import { IProgress } from '../models/Progress.js';

export class ProgressService {
  private progressRepository = new ProgressRepository();

  async getProgressHistory(userId: string): Promise<IProgress[]> {
    return this.progressRepository.getHistory(userId);
  }

  async logProgress(userId: string, weight: number, height: number): Promise<IProgress> {
    const heightInMeters = height / 100;
    const bmi = Number((weight / (heightInMeters * heightInMeters)).toFixed(2));

    return this.progressRepository.create({
      userId,
      weight,
      height,
      bmi
    });
  }

  async predictProgress(userId: string, fitnessGoal: string): Promise<{ weeks: number; projectedWeight: number; bmis: number }[]> {
    const history = await this.progressRepository.getHistory(userId);

    let currentWeight = 70;
    let currentHeight = 175;
    if (history.length > 0) {
      const latest = history[history.length - 1];
      currentWeight = latest.weight;
      currentHeight = latest.height;
    }

    // Determine weight change rate per week (in kg) based on goal
    let rate = 0;
    if (fitnessGoal === 'weight_loss') {
      rate = -0.5; // -0.5 kg per week
    } else if (fitnessGoal === 'weight_gain' || fitnessGoal === 'muscle_gain') {
      rate = 0.25; // +0.25 kg per week
    }

    // Project over 4, 8, and 12 weeks
    const projections = [4, 8, 12].map(weeks => {
      const projectedWeight = Number((currentWeight + (rate * weeks)).toFixed(2));
      const heightInMeters = currentHeight / 100;
      const bmi = Number((projectedWeight / (heightInMeters * heightInMeters)).toFixed(2));

      return {
        weeks,
        projectedWeight,
        bmis: bmi
      };
    });

    return projections;
  }
}
