import express from 'express';
import cors from 'cors';
import { DietController } from './controllers/DietController.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

const dietController = new DietController();

app.get('/', authMiddleware as any, dietController.getLatestDiet);
app.post('/generate', authMiddleware as any, dietController.generateDietPlan);
app.post('/substitute', authMiddleware as any, dietController.getMealSubstitutions);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'diet-service' });
});

app.use(errorHandler);

export default app;
