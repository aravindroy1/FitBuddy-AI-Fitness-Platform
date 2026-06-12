import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import winston from 'winston';

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

const PORT = process.env.PORT || 5005;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`Chatbot Service running on port ${PORT}`);
  });
};

startServer();
