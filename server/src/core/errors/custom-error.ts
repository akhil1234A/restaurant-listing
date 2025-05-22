export class CustomError extends Error {
  public statusCode: number;
  public meta?: object;

  constructor(message: string, statusCode: number, meta?: object) {
    super(message);
    this.statusCode = statusCode;
    this.meta = meta;
    this.name = 'CustomError';
  }
}