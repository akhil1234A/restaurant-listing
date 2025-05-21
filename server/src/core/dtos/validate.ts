import { z } from 'zod';
import { CustomError } from '../errors/custom-error';

export function validate<T>(data: unknown, schema: z.ZodSchema<T>): T {
  try {
    return schema.parse(data);
  } catch (error) {
    throw new CustomError('Invalid input', 400);
  }
}