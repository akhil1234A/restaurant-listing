import { z } from 'zod';

export const AuthDto = z.object({
  email: z.string().email('Invalid email').trim(),
  password: z.string().min(6, 'Password must be at least 6 characters').trim(),
});

export const UserInputDto = z.object({
  id: z.string().optional(),
  email: z.string().email('Invalid email').trim(),
  password: z.string().min(6, 'Password must be at least 6 characters').trim(),
});

export interface UserDTO {
  id: string;
  email: string;
}