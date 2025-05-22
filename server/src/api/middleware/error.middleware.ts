import { Request, Response, NextFunction } from 'express';
import { injectable } from 'inversify';
import { CustomError } from '../../core/errors/custom-error';
import { Logger } from '../../infrastructure/logging/logger';

@injectable()
export class ErrorMiddleware {
  public handle(error: Error, req: Request, res: Response, next: NextFunction) {
    if (error instanceof CustomError) {
      Logger.error(`${error.message} - Status: ${error.statusCode}`, { stack: error.stack, meta: error.meta });
      const response: { message: string; issues?: unknown } = { message: error.message };
      if (error.meta) {
        response.issues = error.meta;
      }
      return res.status(error.statusCode).json(response);
    }

    Logger.error('Unexpected error', { error, stack: error.stack });
    res.status(500).json({ message: 'Internal server error' });
  }
}