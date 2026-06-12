import mongoose from 'mongoose';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/bodygpt';
    await mongoose.connect(mongoURI);
    logger.info('Connected to Azure Cosmos DB / MongoDB successfully in Progress Service.');
  } catch (error) {
    logger.error('Failed to connect to the database in Progress Service:', error);
    process.exit(1);
  }
};
