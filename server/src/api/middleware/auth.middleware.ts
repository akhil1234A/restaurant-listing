import { Request, Response, NextFunction } from 'express';
import { injectable } from 'inversify';
import * as jwt from 'jsonwebtoken';
import { CustomError } from '../../core/errors/custom-error';
import { CustomRequest } from '../../core/types/express';
import { Logger } from '../../infrastructure/logging/logger';

@injectable()
export class AuthMiddleware {
  private readonly COOKIE_TOKEN_NAME = 'accessToken';

  public verifyToken(req: CustomRequest, res: Response, next: NextFunction) {
    const token = req.cookies?.[this.COOKIE_TOKEN_NAME];
    Logger.debug('Verifying token', { token: token ? '[present]' : '[missing]', path: req.path });

    if (!token) {
      Logger.warn('No authorization token provided', { path: req.path });
      throw new CustomError('Authorization token required', 401);
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        Logger.error('JWT_SECRET environment variable is not set');
        throw new CustomError('Server configuration error', 500);
      }

      const payload = jwt.verify(token, secret) as { id: string };
      if (!payload.id) {
        Logger.warn('Token payload missing id field', { payload });
        throw new CustomError('Invalid token structure', 401);
      }

      req.user = { id: payload.id };
      Logger.debug('Token verified', { userId: payload.id, path: req.path });
      next();
    } catch (error: any) {
      Logger.error('Token verification failed', {
        error: error.message,
        token: '[redacted]',
        path: req.path,
      });
      if (error instanceof jwt.TokenExpiredError) {
        throw new CustomError('Token expired', 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new CustomError('Invalid token', 401);
      }
      throw new CustomError('Invalid or expired token', 401);
    }
  }
}
