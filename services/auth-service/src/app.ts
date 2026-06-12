import express from 'express';
import cors from 'cors';
import { AuthController } from './controllers/AuthController.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

const authController = new AuthController();

app.post('/register', authController.register);
app.post('/login', authController.login);
app.post('/refresh-token', authController.refreshToken);
app.post('/forgot-password', authController.forgotPassword);
app.post('/verify-otp', authController.verifyOtp);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'auth-service' });
});

app.use(errorHandler);

export default app;
