import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { TYPES } from '../../di/types';
import { IRestaurantService } from '../services/restaurant.service';
import { RestaurantDto } from '../../core/dtos/restaurant.dto';
import { validate } from '../../core/dtos/validate';
import { CustomError } from '../../core/errors/custom-error';
import { CustomRequest } from '../../core/types/express';
import { STATUS_CODES, MESSAGES } from '../../core/constants/constants';
import { getQueryParams } from '@/core/utils/queryParams';

export class RestaurantController {
  constructor(@inject(TYPES.RestaurantService) private restaurantService: IRestaurantService) {}

  /**
   * 
   * @param req userId
   * @param res list of 
   * @param next 
   */
   async listAllRestaurants(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError(MESSAGES.ID_REQUIRED, STATUS_CODES.UNAUTHORIZED);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const searchTerm = req.query.search as string | undefined;

      const { restaurants, total } = await this.restaurantService.fetchAllRestaurants(userId, page, limit, searchTerm);
      res.status(STATUS_CODES.OK).json({
        restaurants,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
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
      const restaurantData = validate<RestaurantDto>(req.body, RestaurantDto);
      const imageFiles = req.files as Express.Multer.File[] | undefined;
      if (!imageFiles) {
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
      const restaurantData = validate<Partial<RestaurantDto>>(req.body, RestaurantDto.partial());
      const imageFiles = req.files as Express.Multer.File[] | undefined;

      const restaurant = await this.restaurantService.updateExistingRestaurant(restaurantId, userId, restaurantData, imageFiles);
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