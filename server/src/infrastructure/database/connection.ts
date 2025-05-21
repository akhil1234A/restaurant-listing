import mongoose from 'mongoose';
import { Logger } from '../logging/logger';

export async function connectToDatabase(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      dbName: 'restuarant',
    });
    Logger.info('Connected to MongoDB');
  } catch (error) {
    Logger.error('Failed to connect to MongoDB', error);
    throw error;
  }
}