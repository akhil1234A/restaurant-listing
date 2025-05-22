import { Router } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../di/types';
import { RestaurantController } from '../controllers/restaurant.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { FileUploadMiddleware } from '../middleware/file-upload.middleware';

@injectable()
export class RestaurantRoutes {
  public router: Router;

  constructor(
    @inject(TYPES.RestaurantController) private restaurantController: RestaurantController,
    @inject(TYPES.AuthMiddleware) private authMiddleware: AuthMiddleware,
    @inject(TYPES.FileUploadMiddleware) private fileUploadMiddleware: FileUploadMiddleware
  ) {
    this.router = Router();
    this.configureRoutes();
  }

  private configureRoutes() {
    this.router.get(
      '/',
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.restaurantController.listAllRestaurants.bind(this.restaurantController)
    );

    this.router.post(
      '/',
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.fileUploadMiddleware.upload.array('images', 10),
      this.restaurantController.createNewRestaurant.bind(this.restaurantController)
    );

    this.router.put(
      '/:id',
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.fileUploadMiddleware.upload.array('images', 10),
      this.restaurantController.updateExistingRestaurant.bind(this.restaurantController)
    );

    this.router.delete(
      '/:id',
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.restaurantController.deleteRestaurantById.bind(this.restaurantController)
    );
  }
}