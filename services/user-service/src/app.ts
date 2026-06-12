import express from 'express';
import cors from 'cors';
import { ProfileController } from './controllers/ProfileController.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

const profileController = new ProfileController();

app.get('/profile', authMiddleware as any, profileController.getProfile);
app.post('/profile', authMiddleware as any, profileController.createProfile);
app.put('/profile', authMiddleware as any, profileController.updateProfile);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'user-service' });
});

app.use(errorHandler);

export default app;
