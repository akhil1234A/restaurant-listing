import { Request, Response, NextFunction } from 'express';
import { injectable } from 'inversify';
import * as jwt from 'jsonwebtoken';
import { CustomError } from '../../core/errors/custom-error';
import { CustomRequest } from '../../core/types/express';

@injectable()
export class AuthMiddleware {
  private readonly COOKIE_TOKEN_NAME = 'accessToken'; 

  public verifyToken(req: CustomRequest, res: Response, next: NextFunction) {
    // Extract token from cookies
    const token = req.cookies?.[this.COOKIE_TOKEN_NAME];

    if (!token) {
      throw new CustomError('Authorization token required', 401);
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET environment variable is not set');
      }

      const payload = jwt.verify(token, secret) as { id: string };
      req.user = { id: payload.id };
      next();
    } catch (error) {
      throw new CustomError('Invalid or expired token', 401);
    }
  }
}