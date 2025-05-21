export const TYPES = {
  AuthService: Symbol.for('AuthService'),
  RestaurantService: Symbol.for('RestaurantService'),
  UserRepository: Symbol.for('UserRepository'),
  RestaurantRepository: Symbol.for('RestaurantRepository'),
  S3Service: Symbol.for('S3Service'),
  Logger: Symbol.for('Logger'),
  AuthController: Symbol.for('AuthController'),
  RestaurantController: Symbol.for('RestaurantController'),
  AuthMiddleware: Symbol.for('AuthMiddleware'),
  FileUploadMiddleware: Symbol.for('FileUploadMiddleware'),
  ErrorMiddleware: Symbol.for('ErrorMiddleware'),
};