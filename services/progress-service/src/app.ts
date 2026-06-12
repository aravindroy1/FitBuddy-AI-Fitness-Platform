import express from 'express';
import cors from 'cors';
import { ProgressController } from './controllers/ProgressController.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

const progressController = new ProgressController();

app.get('/', authMiddleware as any, progressController.getProgressHistory);
app.post('/', authMiddleware as any, progressController.logProgress);
app.get('/predict', authMiddleware as any, progressController.predictProgress);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'progress-service' });
});

app.use(errorHandler);

export default app;
