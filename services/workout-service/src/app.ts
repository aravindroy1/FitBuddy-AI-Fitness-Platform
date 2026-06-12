import express from 'express';
import cors from 'cors';
import { WorkoutController } from './controllers/WorkoutController.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

const workoutController = new WorkoutController();

app.get('/', authMiddleware as any, workoutController.getLatestWorkout);
app.post('/generate', authMiddleware as any, workoutController.generateWorkoutPlan);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'workout-service' });
});

app.use(errorHandler);

export default app;
