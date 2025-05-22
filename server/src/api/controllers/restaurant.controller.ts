import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { TYPES } from '../../di/types';
import { IRestaurantService } from '../services/restaurant.service';
import { RestaurantDto } from '../../core/dtos/restaurant.dto';
import { validate } from '../../core/dtos/validate';
import { CustomError } from '../../core/errors/custom-error';
import { CustomRequest } from '../../core/types/express';
import { STATUS_CODES, MESSAGES } from '../../core/constants/constants';
import { z } from 'zod';

export class RestaurantController {
  constructor(@inject(TYPES.RestaurantService) private restaurantService: IRestaurantService) {}

  /**
   * List all Restaurants
   * @param req
   * @param res
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

      const { restaurants, total } = await this.restaurantService.fetchAllRestaurantsPublic(page, limit, searchTerm);
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

  /**
   * Get a restaurant by ID
   * @param req
   * @param res
   * @param next
   */
  async getRestaurantById(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { id: restaurantId } = req.params;
      if (!userId) {
        throw new CustomError(MESSAGES.ID_REQUIRED, STATUS_CODES.UNAUTHORIZED);
      }

      const restaurant = await this.restaurantService.getRestaurantById(restaurantId);
      res.status(STATUS_CODES.OK).json({ restaurant });
    } catch (error) {
      next(error);
    }
  }

  /**
   * This method creates new restaurant
   * @param req id
   * @param res restaurant data
   * @param next
   */
  async createNewRestaurant(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError(MESSAGES.ID_REQUIRED, STATUS_CODES.UNAUTHORIZED);
      }

      // Preprocess req.body for form-data
      const restaurantDataRaw = {
        ...req.body,
        categories: typeof req.body.categories === 'string' ? req.body.categories : JSON.stringify(req.body.categories || []),
        description: req.body.description || undefined,
        website: req.body.website || undefined,
        phoneNumber: req.body.phoneNumber,
        openingTime: req.body.openingTime,
        closingTime: req.body.closingTime,
        offersDelivery: req.body.offersDelivery ?? 'false',
        offersDineIn: req.body.offersDineIn ?? 'false',
        offersPickup: req.body.offersPickup ?? 'false',
      };

      const restaurantData = validate<z.infer<typeof RestaurantDto>>(restaurantDataRaw, RestaurantDto);
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

  /**
   * This method update existing restaurant
   * @param req
   * @param res
   * @param next
   */
  async updateExistingRestaurant(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { id: restaurantId } = req.params;
      if (!userId) {
        throw new CustomError(MESSAGES.ID_REQUIRED, STATUS_CODES.UNAUTHORIZED);
      }

      // Preprocess req.body for form-data
      const restaurantDataRaw = {
        ...req.body,
        categories: typeof req.body.categories === 'string' ? req.body.categories : JSON.stringify(req.body.categories || []),
        description: req.body.description || undefined,
        website: req.body.website || undefined,
        phoneNumber: req.body.phoneNumber || undefined,
        openingTime: req.body.openingTime || undefined,
        closingTime: req.body.closingTime || undefined,
        offersDelivery: req.body.offersDelivery ?? undefined,
        offersDineIn: req.body.offersDineIn ?? undefined,
        offersPickup: req.body.offersPickup ?? undefined,
      };

      const restaurantData = validate<Partial<z.infer<typeof RestaurantDto>>>(restaurantDataRaw, RestaurantDto.partial());
      const imageFiles = req.files as Express.Multer.File[] | undefined;

      const restaurant = await this.restaurantService.updateExistingRestaurant(restaurantId, userId, restaurantData, imageFiles);
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.UPDATED, restaurant });
    } catch (error) {
      next(error);
    }
  }

  /**
   * This method delete restaurant by id
   * @param req
   * @param res
   * @param next
   */
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