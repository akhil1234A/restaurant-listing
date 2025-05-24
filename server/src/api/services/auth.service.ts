import { injectable, inject } from 'inversify';
import { TYPES } from '../../di/types';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { CustomError } from '../../core/errors/custom-error';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthDto } from '../../core/dtos/auth.dto';
import { IUser } from '../../domain/models/user.model';
import { Logger } from '../../infrastructure/logging/logger';

export interface IAuthService {
  registerUser(credentials: AuthDto): Promise<{ accessToken: string; refreshToken: string; user: { id: string; email: string } }>;
  loginUser(credentials: AuthDto): Promise<{ accessToken: string; refreshToken: string; user: { id: string; email: string } }>;
  refreshAuthToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; user: { id: string; email: string } }>;
}

@injectable()
export class AuthService implements IAuthService {
  constructor(@inject(TYPES.UserRepository) private userRepository: IUserRepository) {
    if (!process.env.JWT_SECRET) {
      Logger.error('JWT_SECRET environment variable is not set');
      throw new Error('JWT_SECRET is required');
    }
    if (!process.env.JWT_REFRESH_SECRET) {
      Logger.error('JWT_REFRESH_SECRET environment variable is not set');
      throw new Error('JWT_REFRESH_SECRET is required');
    }
  }

  async registerUser(credentials: AuthDto) {
    const { email, password } = credentials;
    Logger.debug('Registering user', { email });

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      Logger.warn('User already exists', { email });
      throw new CustomError('User already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepository.create({ email, password: hashedPassword });
    Logger.info('User registered', { userId: user.id, email });

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);
    const userResponse = { id: user.id, email: user.email };

    return { accessToken, refreshToken, user: userResponse };
  }

  async loginUser(credentials: AuthDto) {
    const { email, password } = credentials;
    Logger.debug('Logging in user', { email });

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      Logger.warn('User not found', { email });
      throw new CustomError('Invalid credentials', 401);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      Logger.warn('Invalid password', { email });
      throw new CustomError('Invalid credentials', 401);
    }
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);
    const userResponse = { id: user.id, email: user.email };
    Logger.info('User logged in', { userId: user.id, email });

    return { accessToken, refreshToken, user: userResponse };
  }

  async refreshAuthToken(refreshToken: string) {
    Logger.debug('Refreshing token', { token: '[redacted]' });

    try {
      if (!refreshToken) {
        Logger.warn('No refresh token provided');
        throw new CustomError('Refresh token required', 401);
      }

      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { id?: string };
      Logger.info('Decoded payload', { payload }); 
      if (!payload.id) {
        Logger.warn('Refresh token payload missing id field', { payload });
        throw new CustomError('Invalid refresh token structure: missing user ID', 401);
      }

      Logger.debug('Refresh token verified', { userId: payload.id });
      const user = await this.userRepository.findById(payload.id);
      if (!user) {
        Logger.warn('User not found for refresh token', { userId: payload.id });
        throw new CustomError('Invalid refresh token: user not found', 401);
      }

      const accessToken = this.generateAccessToken(user.id);
      const newRefreshToken = this.generateRefreshToken(user.id);
      const userResponse = { id: user.id, email: user.email };
      Logger.info('Token refreshed', { userId: user.id, email: user.email });

      return { accessToken, refreshToken: newRefreshToken, user: userResponse };
    } catch (error: any) {
      Logger.error('Refresh token verification failed', {
        error: error.message,
        token: '[redacted]',
      });
      if (error instanceof jwt.TokenExpiredError) {
        throw new CustomError('Refresh token expired', 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new CustomError('Invalid refresh token', 401);
      }
      throw error instanceof CustomError ? error : new CustomError('Invalid refresh token', 401);
    }
  }

  private generateAccessToken(userId: string): string {
    if (!userId) {
      Logger.error('Cannot generate access token: userId is missing');
      throw new CustomError('Invalid user ID', 400);
    }
    const payload = { id: userId };
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '15m' });
    Logger.debug('Access token generated', { userId, payload: jwt.decode(token) });
    return token;
  }

  private generateRefreshToken(userId: string): string {
    if (!userId) {
      Logger.error('Cannot generate refresh token: userId is missing');
      throw new CustomError('Invalid user ID', 400);
    }
    const payload = { id: userId };
    const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
    Logger.debug('Refresh token generated', { userId, payload: jwt.decode(token) });
    return token;
  }
}
