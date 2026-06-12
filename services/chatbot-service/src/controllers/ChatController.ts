import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { ChatService } from '../services/ChatService.js';

export class ChatController {
  private chatService = new ChatService();

  getChatHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const history = await this.chatService.getChatHistory(userId);
      res.status(200).json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  askCoach = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { message } = req.body;
      if (!message) {
        res.status(400).json({ error: 'Message content is required' });
        return;
      }

      const reply = await this.chatService.askCoach(userId, message);
      res.status(200).json(reply);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  clearHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      await this.chatService.clearHistory(userId);
      res.status(200).json({ message: 'Conversation history cleared successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
