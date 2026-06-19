import { WorkoutRepository } from '../repositories/WorkoutRepository.js';
import { IWorkout, IExercise } from '../models/Workout.js';
import { AzureOpenAI } from 'openai';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

export class WorkoutService {
  private workoutRepository = new WorkoutRepository();

  async getLatestWorkout(userId: string): Promise<IWorkout | null> {
    return this.workoutRepository.findByUserId(userId);
  }

  async generateWorkoutPlan(
    userId: string,
    type: 'home' | 'gym',
    goal: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'body_recomposition'
  ): Promise<IWorkout> {
    logger.info(`Generating ${type} workout plan for user ${userId} with goal ${goal}`);

    let split = 'Push / Pull / Legs';
    let exercises: IExercise[] = [];

    if (process.env.AZURE_AI_FOUNDRY_ENDPOINT && process.env.AZURE_OPENAI_API_KEY) {
      logger.info('Calling Azure AI Foundry to generate structured workout plan...');
      try {
        const client = new AzureOpenAI({
          endpoint: process.env.AZURE_AI_FOUNDRY_ENDPOINT,
          apiKey: process.env.AZURE_OPENAI_API_KEY,
          apiVersion: "2024-05-01-preview"
        });
        const equipmentRule = type === 'home' ? 'Use ONLY bodyweight exercises. NO equipment like dumbbells, barbells, or machines allowed.' : 'Use standard gym equipment.';
        const prompt = `Generate a personalized ${type} workout plan for the goal: ${goal}. ${equipmentRule} Return ONLY a valid JSON object with two fields: 'split' (string, name of the split) and 'exercises' (array of objects, where each object has name, sets (number), reps (string), weight (string), restSeconds (number), and targetMuscle (string)).`;
        const result = await client.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }]
        });
        const content = result.choices[0].message?.content || '{}';
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        split = parsed.split || split;
        exercises = parsed.exercises || [];
      } catch (err: any) {
        logger.error(`Error calling Azure OpenAI: ${err.message}`);
      }
    }

    if (exercises.length === 0) {
      if (type === 'gym') {
      if (goal === 'muscle_gain' || goal === 'weight_gain') {
        split = 'Hypertrophy Push / Pull / Legs';
        exercises = [
          { name: 'Barbell Bench Press', sets: 4, reps: '8-12', weight: '70% 1RM', restSeconds: 90, targetMuscle: 'Chest' },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', weight: 'Moderately Heavy', restSeconds: 75, targetMuscle: 'Chest' },
          { name: 'Barbell Row', sets: 4, reps: '8-10', weight: '70% 1RM', restSeconds: 90, targetMuscle: 'Back' },
          { name: 'Lat Pulldowns', sets: 3, reps: '12', weight: 'Moderate', restSeconds: 60, targetMuscle: 'Back' },
          { name: 'Barbell Squats', sets: 4, reps: '8-10', weight: '75% 1RM', restSeconds: 120, targetMuscle: 'Legs (Quads)' },
          { name: 'Romanian Deadlifts', sets: 3, reps: '10-12', weight: 'Moderately Heavy', restSeconds: 90, targetMuscle: 'Legs (Hamstrings)' }
        ];
      } else {
        split = 'Full Body Conditioning';
        exercises = [
          { name: 'Dumbbell Goblet Squat', sets: 3, reps: '15', weight: 'Light-Medium', restSeconds: 45, targetMuscle: 'Legs' },
          { name: 'Dumbbell Shoulder Press', sets: 3, reps: '12', weight: 'Light-Medium', restSeconds: 45, targetMuscle: 'Shoulders' },
          { name: 'Seated Cable Row', sets: 3, reps: '15', weight: 'Medium', restSeconds: 45, targetMuscle: 'Back' },
          { name: 'Push-Ups (weighted if possible)', sets: 3, reps: 'AMRAP', restSeconds: 60, targetMuscle: 'Chest' },
          { name: 'Treadmill Incline Walk', sets: 1, reps: '20 mins', weight: 'Speed 5.0 / Incline 8.0', restSeconds: 0, targetMuscle: 'Cardio' }
        ];
      }
    } else {
      // Home workouts (Bodyweight)
      if (goal === 'muscle_gain' || goal === 'body_recomposition') {
        split = 'Bodyweight Strength Progression';
        exercises = [
          { name: 'Bodyweight Squats (or Pistol Squat progression)', sets: 4, reps: '20', restSeconds: 60, targetMuscle: 'Legs' },
          { name: 'Push-Ups (or Decline Push-Ups)', sets: 4, reps: '15-20', restSeconds: 60, targetMuscle: 'Chest' },
          { name: 'Doorframe Pulls or Inverted Row (under a table)', sets: 4, reps: '12-15', restSeconds: 60, targetMuscle: 'Back' },
          { name: 'Pike Push-ups', sets: 3, reps: '10-12', restSeconds: 60, targetMuscle: 'Shoulders' },
          { name: 'Bench / Chair Dips', sets: 3, reps: '15', restSeconds: 45, targetMuscle: 'Triceps' }
        ];
      } else {
        split = 'HIIT Home Fat Burner';
        exercises = [
          { name: 'Jumping Jacks', sets: 3, reps: '45 seconds', restSeconds: 15, targetMuscle: 'Cardio' },
          { name: 'Bodyweight Squats', sets: 3, reps: '45 seconds', restSeconds: 15, targetMuscle: 'Legs' },
          { name: 'Mountain Climbers', sets: 3, reps: '45 seconds', restSeconds: 15, targetMuscle: 'Core/Cardio' },
          { name: 'Push-Ups', sets: 3, reps: '45 seconds', restSeconds: 15, targetMuscle: 'Chest' },
          { name: 'Plank Hold', sets: 3, reps: '60 seconds', restSeconds: 30, targetMuscle: 'Core' }
        ];
      }
      }
    }

    return this.workoutRepository.create({
      userId,
      type,
      split,
      exercises
    });
  }
}
