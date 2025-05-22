import { injectable } from 'inversify';
import { Restaurant, IRestaurant } from '../models/restaurant.model';
import { CustomError } from '../../core/errors/custom-error';
import { BaseRepository } from './base.repository';
import { IBaseRepository } from '../../core/interfaces/base.repository';

export interface IRestaurantRepository extends IBaseRepository<IRestaurant> {
  findAllByUserId(
    userId: string,
    page: number,
    limit: number,
    searchTerm?: string
  ): Promise<{ restaurants: IRestaurant[]; total: number }>;
  findAllPublic(
    page: number,
    limit: number,
    searchTerm?: string
  ): Promise<{ restaurants: IRestaurant[]; total: number }>;
}

@injectable()
export class RestaurantRepository extends BaseRepository<IRestaurant> implements IRestaurantRepository {
  constructor() {
    super(Restaurant);
  }

  async findAllByUserId(
    userId: string,
    page: number,
    limit: number,
    searchTerm?: string
  ): Promise<{ restaurants: IRestaurant[]; total: number }> {
    const query: any = { userId };
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { categories: { $regex: searchTerm, $options: 'i' } },
        { city: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const total = await this.model.countDocuments(query);
    const restaurants = await this.model
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();

    return { restaurants, total };
  }

  async findAllPublic(
    page: number,
    limit: number,
    searchTerm?: string
  ): Promise<{ restaurants: IRestaurant[]; total: number }> {
    const query: any = {};
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { categories: { $regex: searchTerm, $options: 'i' } },
        { city: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const total = await this.model.countDocuments(query);
    const restaurants = await this.model
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();

    return { restaurants, total };
  }
}