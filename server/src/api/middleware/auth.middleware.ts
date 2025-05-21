import { Request, Response, NextFunction } from 'express';
import { injectable } from 'inversify';
import * as jwt from 'jsonwebtoken';
import { CustomError } from '../../core/errors/custom-error';
import { CustomRequest } from '../../core/types/express';

@injectable()
export class AuthMiddleware {
  public verifyToken(req: CustomRequest, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new CustomError('Authorization token required', 401);
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      req.user = { id: payload.id };
      next();
    } catch (error) {
      throw new CustomError('Invalid or expired token', 401);
    }
  }
}