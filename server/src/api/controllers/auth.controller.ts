import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { TYPES } from '../../di/types';
import { IAuthService } from '../services/auth.service';
import { AuthDto } from '../../core/dtos/auth.dto';
import { validate } from '../../core/dtos/validate';
import { CustomError } from '../../core/errors/custom-error';
import { STATUS_CODES, MESSAGES } from '../../core/constants/constants';

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
        sameSite: 'strict',
        maxAge: 3600000, // 1 hour
      });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 3600000, // 7 days
      });
      res.status(STATUS_CODES.CREATED).json({ message: MESSAGES.REGISTER_SUCCESS, user });
    } catch (error) {
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
        sameSite: 'strict',
        maxAge: 3600000, // 1 hour
      });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 3600000, // 7 days
      });
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.LOGIN_SUCCESS, user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refreshes authentication tokens using refresh token
   * @param req - Request containing refresh token in cookies
   * @param res - Response with new authentication cookies
   * @param next - Next function for error handling
   */
  async refreshAuthToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        throw new CustomError(MESSAGES.REFRESH_TOKEN_REQUIRED, STATUS_CODES.BAD_REQUEST);
      }
      const { accessToken, refreshToken: newRefreshToken, user } = await this.authService.refreshAuthToken(refreshToken);
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000, // 1 hour
      });
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 3600000, // 7 days
      });
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.REFRESH_SUCCESS, user });
    } catch (error) {
      next(error);
    }
  }
}