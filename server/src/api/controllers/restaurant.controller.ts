import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { TYPES } from '../../di/types';
import { IRestaurantService } from '../services/restaurant.service';
import { CustomError } from '../../core/errors/custom-error';
import { CustomRequest } from '../../core/types/express';
import { STATUS_CODES, MESSAGES } from '../../core/constants/constants';
import { getPaginationParams, formatPaginatedResponse } from '../../core/utils/pagination';
import { preprocessRestaurantData } from '../../core/utils/request-preprocessor';

export class RestaurantController {
  constructor(@inject(TYPES.RestaurantService) private restaurantService: IRestaurantService) {}

  async listAllRestaurants(req: CustomRequest, res: Response, next: NextFunction) {
    try {
     
      const { page, limit, searchTerm } = getPaginationParams(req);
      const { restaurants, total } = await this.restaurantService.fetchAllRestaurantsPublic(page, limit, searchTerm);

      res.status(STATUS_CODES.OK).json(formatPaginatedResponse(restaurants, page, limit, total));
    } catch (error) {
      next(error);
    }
  }

  async getRestaurantById(req: CustomRequest, res: Response, next: NextFunction) {
    try {
   
      const { id: restaurantId } = req.params;
    

      const restaurant = await this.restaurantService.getRestaurantById(restaurantId);
      res.status(STATUS_CODES.OK).json({ restaurant });
    } catch (error) {
      next(error);
    }
  }

  async createNewRestaurant(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError(MESSAGES.ID_REQUIRED, STATUS_CODES.UNAUTHORIZED);
      }

      const restaurantData = preprocessRestaurantData(req.body, false);
      const imageFiles = req.files as Express.Multer.File[] | undefined;
      if (!imageFiles || imageFiles.length < 3) {
        throw new CustomError(MESSAGES.IMAGE_REQUIRED, STATUS_CODES.BAD_REQUEST);
      }

      const restaurant = await this.restaurantService.createNewRestaurant(userId, restaurantData, imageFiles);
      res.status(STATUS_CODES.CREATED).json({ message: MESSAGES.CREATED, restaurant });
    } catch (error) {
      next(error);
    }
  }

  async updateExistingRestaurant(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { id: restaurantId } = req.params;
      if (!userId) {
        throw new CustomError(MESSAGES.ID_REQUIRED, STATUS_CODES.UNAUTHORIZED);
      }

      const restaurantData = preprocessRestaurantData(req.body, true);
      const imageFiles = req.files as Express.Multer.File[] | undefined;
      const imagesToKeep = req.body.imagesToKeep ? (Array.isArray(req.body.imagesToKeep) ? req.body.imagesToKeep : [req.body.imagesToKeep]) : [];
      const imagesToRemove = req.body.imagesToRemove ? (Array.isArray(req.body.imagesToRemove) ? req.body.imagesToRemove : [req.body.imagesToRemove]) : [];

      const restaurant = await this.restaurantService.updateExistingRestaurant(
        restaurantId,
        userId,
        restaurantData,
        imageFiles,
        imagesToKeep,
        imagesToRemove
      );
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.UPDATED, restaurant });
    } catch (error) {
      next(error);
    }
  }

  async deleteRestaurantById(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { id: restaurantId } = req.params;
      if (!userId) {
        throw new CustomError(MESSAGES.ID_REQUIRED, STATUS_CODES.UNAUTHORIZED);
      }
      await this.restaurantService.deleteRestaurantById(restaurantId, userId);
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.DELETED });
    } catch (error) {
      next(error);
    }
  }
}