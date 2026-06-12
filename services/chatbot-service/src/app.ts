import express from 'express';
import cors from 'cors';
import { ChatController } from './controllers/ChatController.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

const chatController = new ChatController();

app.get('/', authMiddleware as any, chatController.getChatHistory);
app.post('/', authMiddleware as any, chatController.askCoach);
app.delete('/', authMiddleware as any, chatController.clearHistory);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'chatbot-service' });
});

app.use(errorHandler);

export default app;
