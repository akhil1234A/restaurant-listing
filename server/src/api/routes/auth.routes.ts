import { Router } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../di/types';
import { AuthController } from '../controllers/auth.controller';

@injectable()
export class AuthRoutes {
  public router: Router;

  constructor(@inject(TYPES.AuthController) private authController: AuthController) {
    this.router = Router();
    this.configureRoutes();
  }

  private configureRoutes() {
    this.router.post('/register', this.authController.registerUser.bind(this.authController));
    this.router.post('/login', this.authController.loginUser.bind(this.authController));
    this.router.post('/refresh', this.authController.refreshAuthToken.bind(this.authController));
  }
}