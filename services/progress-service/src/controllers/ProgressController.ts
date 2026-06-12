import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { ProgressService } from '../services/ProgressService.js';

export class ProgressController {
  private progressService = new ProgressService();

  getProgressHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const history = await this.progressService.getProgressHistory(userId);
      res.status(200).json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  logProgress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { weight, height } = req.body;
      if (weight === undefined || height === undefined) {
        res.status(400).json({ error: 'Weight and height are required' });
        return;
      }

      const log = await this.progressService.logProgress(userId, Number(weight), Number(height));
      res.status(201).json(log);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  predictProgress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const fitnessGoal = (req.query.goal as string) || 'body_recomposition';
      const predictions = await this.progressService.predictProgress(userId, fitnessGoal);
      res.status(200).json(predictions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
