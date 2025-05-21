import { z } from 'zod';

export const AuthDto = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type AuthDto = z.infer<typeof AuthDto>;