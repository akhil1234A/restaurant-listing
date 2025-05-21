import { Request, Response, NextFunction } from "express";
import { inject } from "inversify";
import { TYPES } from "../../di/types";
import { AuthService } from "../services/auth.service";
import { AuthDto } from "../../core/dtos/auth.dto";
import { validate } from "../../core/dtos/validate";
import { CustomError } from "../../core/errors/custom-error";
import { STATUS_CODES, MESSAGES } from "@/core/constants/constants";

export class AuthController {
  constructor(@inject(TYPES.AuthService) private authService: AuthService) {}

  /**
   * This controller handles registration of a user
   * @param req email, password
   * @param res accessToken, refreshToken, user
   * @param next
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = validate<AuthDto>(req.body, AuthDto);
      const { accessToken, refreshToken, user } = await this.authService.register(dto);
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600000, // 1 hour
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 3600000, // 7 days
      });
      res.status(STATUS_CODES.CREATED).json({ message: MESSAGES.REGISTER_SUCCESS, user });    
    } catch (error) {
      next(error);
    }
  }

  /**
   * This controller handles login
   * @param req email password
   * @param res accessToken, refreshToken, user
   * @param next
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = validate<AuthDto>(req.body, AuthDto);
      const { accessToken, refreshToken, user } = await this.authService.login(dto);
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000,
      });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 3600000,
      });
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.LOGIN_SUCCESS, user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * This method handles refresh token
   * @param req refreshToken
   * @param res accessToken, refreshToken, user
   * @param next
   */
 async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        throw new CustomError(MESSAGES.REFRESH_TOKEN_REQUIRED, STATUS_CODES.BAD_REQUEST);
      }
      const { accessToken, refreshToken: newRefreshToken } = await this.authService.refreshToken(refreshToken);
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000,
      });
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 3600000,
      });
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.REFRESH_SUCCESS });
    } catch (error) {
      next(error);
    }
  }
}
