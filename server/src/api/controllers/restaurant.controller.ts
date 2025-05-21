import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { TYPES } from '../../di/types';
import { RestaurantService } from '../services/restaurant.service';
import { RestaurantDto } from '../../core/dtos/restaurant.dto';
import { validate } from '../../core/dtos/validate';
import { CustomError } from '../../core/errors/custom-error';
import { CustomRequest } from '../../core/types/express';
import { STATUS_CODES, MESSAGES } from '@/core/constants/constants';

export class RestaurantController {
  constructor(@inject(TYPES.RestaurantService) private restaurantService: RestaurantService) {}

  async getAll(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError(MESSAGES.ID_REQUIRED, STATUS_CODES.UNAUTHORIZED);
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;

      const { restaurants, total } = await this.restaurantService.getRestaurants(userId, page, limit, search);
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

  async create(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError(MESSAGES.ID_REQUIRED, STATUS_CODES.UNAUTHORIZED);
      }
      const dto = validate<RestaurantDto>(req.body, RestaurantDto);
      const files = req.files as Express.Multer.File[] | undefined;
      if (!files) {
        throw new CustomError(MESSAGES.IMAGE_REQUIRED, STATUS_CODES.BAD_REQUEST);
      }

      const restaurant = await this.restaurantService.createRestaurant(userId, dto, files);
      res.status(STATUS_CODES.CREATED).json({ message: MESSAGES.CREATED, restaurant });
    } catch (error) {
      next(error);
    }
  }

  async update(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) {
        throw new CustomError(MESSAGES.ID_REQUIRED, STATUS_CODES.UNAUTHORIZED);
      }
      const dto = validate<Partial<RestaurantDto>>(req.body, RestaurantDto.partial());
      const files = req.files as Express.Multer.File[] | undefined;

      const restaurant = await this.restaurantService.updateRestaurant(id, userId, dto, files);
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.UPDATED, restaurant });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) {
        throw new CustomError(MESSAGES.ID_REQUIRED, STATUS_CODES.UNAUTHORIZED);
      }
      await this.restaurantService.deleteRestaurant(id, userId);
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.UPDATED });
    } catch (error) {
      next(error);
    }
  }
}