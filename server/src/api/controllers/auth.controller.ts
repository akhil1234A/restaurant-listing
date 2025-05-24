import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../di/types';
import { IAuthService } from '../services/auth.service';
import { AuthDto } from '../../core/dtos/auth.dto';
import { validate } from '../../core/dtos/validate';
import { CustomError } from '../../core/errors/custom-error';
import { STATUS_CODES, MESSAGES } from '../../core/constants/constants';
import { Logger } from '../../infrastructure/logging/logger';

@injectable()
export class AuthController {
  constructor(@inject(TYPES.AuthService) private authService: IAuthService) {}

  /**
   * Registers a new user and sets authentication cookies
   * @param req - Request containing email and password in body
   * @param res - Response with user data and authentication cookies
   * @param next - Next function for error handling
   */
  async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const credentials = validate<AuthDto>(req.body, AuthDto);
      const { accessToken, refreshToken, user } = await this.authService.registerUser(credentials);
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.status(STATUS_CODES.CREATED).json({ message: MESSAGES.REGISTER_SUCCESS, user, accessToken, refreshToken });
    } catch (error) {
      const err = error as Error; 
      Logger.error('User registration failed', { error: err.message });
      next(error);
    }
  }

  /**
   * Authenticates a user and sets authentication cookies
   * @param req - Request containing email and password in body
   * @param res - Response with user data and authentication cookies
   * @param next - Next function for error handling
   */
  async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const credentials = validate<AuthDto>(req.body, AuthDto);
      const { accessToken, refreshToken, user } = await this.authService.loginUser(credentials);
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.LOGIN_SUCCESS, user, accessToken, refreshToken });
    } catch (error) {
      const err = error as Error; 
      Logger.error('User login failed', { error: err.message });
      next(error);
    }
  }

  /**
   * Refreshes authentication tokens using refresh token
   * @param req - Request containing refresh token in body
   * @param res - Response with new authentication cookies
   * @param next - Next function for error handling
   */
  async refreshAuthToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken; 
      Logger.info('Refresh token request', { refreshToken: refreshToken ? '[present]' : '[missing]' });
      if (!refreshToken) {
        throw new CustomError(MESSAGES.REFRESH_TOKEN_REQUIRED, STATUS_CODES.BAD_REQUEST);
      }
      const { accessToken, refreshToken: newRefreshToken, user } = await this.authService.refreshAuthToken(refreshToken);
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.REFRESH_SUCCESS, user, accessToken, newRefreshToken });
    } catch (error) {
      const err = error as Error; 
      Logger.error('Refresh token request failed', { error: err.message });
      next(error);
    }
  }

  /**
   * Logs out a user by clearing authentication cookies
   * @param req - Request
   * @param res - Response clearing authentication cookies
   * @param next - Next function for error handling
   */
  async logoutUser(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
      });
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
      });
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.LOGOUT_SUCCESS });
    } catch (error) {
      const err = error as Error; 
      Logger.error('User logout failed', { error: err.message });
      next(error);
    }
  }
}
