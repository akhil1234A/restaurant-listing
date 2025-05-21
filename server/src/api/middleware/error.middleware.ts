import { Request, Response, NextFunction } from 'express';
import { injectable } from 'inversify';
import { CustomError } from '../../core/errors/custom-error';
import { Logger } from '../../infrastructure/logging/logger';

@injectable()
export class ErrorMiddleware {
  public handle(error: Error, req: Request, res: Response, next: NextFunction) {
    if (error instanceof CustomError) {
      Logger.error(`${error.message} - Status: ${error.statusCode}`, { stack: error.stack });
      return res.status(error.statusCode).json({ message: error.message });
    }

    Logger.error('Unexpected error', { error, stack: error.stack });
    res.status(500).json({ message: 'Internal server error' });
  }
}