import { z, ZodError } from 'zod';
import { CustomError } from '../errors/custom-error';

export function validate<T>(data: unknown, schema: z.ZodType<T, any, any>): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code,
        expected: (err as any).expected,
        received: (err as any).received,
      }));
      throw new CustomError('Validation failed', 400, formattedErrors);
    }
    throw new CustomError('Invalid input: ' + (error as Error).message, 400);
  }
}