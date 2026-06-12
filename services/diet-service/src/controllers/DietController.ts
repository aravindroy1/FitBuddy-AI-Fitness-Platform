import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { DietService } from '../services/DietService.js';

export class DietController {
  private dietService = new DietService();

  getLatestDiet = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const diet = await this.dietService.getLatestDiet(userId);
      res.status(200).json(diet);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  generateDietPlan = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { height, weight, age, gender, activityLevel, fitnessGoal } = req.body;
      if (!height || !weight || !age || !gender || !activityLevel || !fitnessGoal) {
        res.status(400).json({ error: 'Missing physical measurements or fitness goal fields' });
        return;
      }

      const diet = await this.dietService.generateDietPlan(userId, {
        height,
        weight,
        age,
        gender,
        activityLevel,
        fitnessGoal
      });
      res.status(201).json(diet);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getMealSubstitutions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { mealName, currentItem } = req.body;
      if (!mealName || !currentItem) {
        res.status(400).json({ error: 'mealName and currentItem are required' });
        return;
      }
      const substitutes = await this.dietService.getMealSubstitution(mealName, currentItem);
      res.status(200).json({ currentItem, substitutes });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
