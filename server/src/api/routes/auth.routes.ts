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
    this.router.post('/register', this.authController.register.bind(this.authController));
    this.router.post('/login', this.authController.login.bind(this.authController));
    this.router.post('/refresh', this.authController.refresh.bind(this.authController));
  }
}