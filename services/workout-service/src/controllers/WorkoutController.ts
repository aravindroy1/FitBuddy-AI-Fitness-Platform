import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { WorkoutService } from '../services/WorkoutService.js';

export class WorkoutController {
  private workoutService = new WorkoutService();

  getLatestWorkout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const workout = await this.workoutService.getLatestWorkout(userId);
      res.status(200).json(workout);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  generateWorkoutPlan = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { type, goal } = req.body;
      if (!type || !goal) {
        res.status(400).json({ error: 'Workout type (home/gym) and fitness goal are required' });
        return;
      }

      if (type !== 'home' && type !== 'gym') {
        res.status(400).json({ error: 'Type must be home or gym' });
        return;
      }

      const workout = await this.workoutService.generateWorkoutPlan(userId, type, goal);
      res.status(201).json(workout);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
