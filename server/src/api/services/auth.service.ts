import { injectable, inject } from 'inversify';
import { TYPES } from '../../di/types';
import { UserRepository } from '../../domain/repositories/user.repository';
import { CustomError } from '../../core/errors/custom-error';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthDto } from '../../core/dtos/auth.dto';

@injectable()
export class AuthService {
  constructor(@inject(TYPES.UserRepository) private userRepository: UserRepository) {}

  async register(dto: AuthDto) {
    const { email, password } = dto;
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new CustomError('User already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepository.create({ email, password: hashedPassword });

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);
    const userResponse = {
      id: user.id,
      email:user.email
    }

    return { accessToken, refreshToken, user: userResponse };
  }

  async login(dto: AuthDto) {
    const { email, password } = dto;
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new CustomError('Invalid credentials', 401);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new CustomError('Invalid credentials', 401);
    }

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);
    const userResponse = {
      id: user.id,
      email:user.email
    }

    return { accessToken, refreshToken, user: userResponse };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { id: string };
      const user = await this.userRepository.findById(payload.id);
      if (!user) {
        throw new CustomError('Invalid refresh token', 401);
      }

      const accessToken = this.generateAccessToken(user.id);
      const newRefreshToken = this.generateRefreshToken(user.id);
      const userResponse = {
      id: user.id,
      email:user.email
    }

      return { accessToken, refreshToken: newRefreshToken, user: userResponse };
    } catch (error) {
      throw new CustomError('Invalid refresh token', 401);
    }
  }

  private generateAccessToken(userId: string): string {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: '15m' });
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
  }
}