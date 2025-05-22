import { Container } from 'inversify';
import { TYPES } from './types';
import { AuthService, IAuthService } from '../api/services/auth.service';
import { UserRepository, IUserRepository } from '../domain/repositories/user.repository';
import { S3Service } from '../infrastructure/s3/s3.service';
import { Logger } from '../infrastructure/logging/logger';
import { AuthController } from '../api/controllers/auth.controller';
import { AuthMiddleware } from '../api/middleware/auth.middleware';
import { FileUploadMiddleware } from '../api/middleware/file-upload.middleware';
import { ErrorMiddleware } from '../api/middleware/error.middleware';
import { RestaurantService, IRestaurantService } from '../api/services/restaurant.service';
import { RestaurantRepository, IRestaurantRepository } from '../domain/repositories/restaurant.repository';
import { RestaurantController } from '../api/controllers/restaurant.controller';
import { AuthRoutes } from '../api/routes/auth.routes';
import { RestaurantRoutes } from '../api/routes/restaurant.routes';

export function configureDI(): Container {
  const container = new Container();

  // Services
  container.bind<IAuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
  container.bind<S3Service>(TYPES.S3Service).to(S3Service).inSingletonScope();
  container.bind<IRestaurantService>(TYPES.RestaurantService).to(RestaurantService).inSingletonScope();

  // Repositories
  container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
  container.bind<IRestaurantRepository>(TYPES.RestaurantRepository).to(RestaurantRepository).inSingletonScope();

  // Controllers
  container.bind<AuthController>(TYPES.AuthController).to(AuthController).inSingletonScope();
  container.bind<RestaurantController>(TYPES.RestaurantController).to(RestaurantController).inSingletonScope();

  // Middleware
  container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware).inSingletonScope();
  container.bind<FileUploadMiddleware>(TYPES.FileUploadMiddleware).to(FileUploadMiddleware).inSingletonScope();
  container.bind<ErrorMiddleware>(TYPES.ErrorMiddleware).to(ErrorMiddleware).inSingletonScope();

  // Routes
  container.bind<AuthRoutes>(AuthRoutes).to(AuthRoutes).inSingletonScope();
  container.bind<RestaurantRoutes>(RestaurantRoutes).to(RestaurantRoutes).inSingletonScope();

  // Logger
  container.bind<typeof Logger>(TYPES.Logger).toConstantValue(Logger);

  return container;
}