import { injectable } from 'inversify';
import { Restaurant, IRestaurant } from '../models/restaurant.model';
import { CustomError } from '../../core/errors/custom-error';
import { BaseRepository } from './base.repository';
import { IBaseRepository } from '../../core/interfaces/base.repository';
import { RestaurantDTO } from '../../core/dtos/restaurant.dto';

export interface IRestaurantRepository extends IBaseRepository<RestaurantDTO> {
  findAllByUserId(
    userId: string,
    page: number,
    limit: number,
    searchTerm?: string
  ): Promise<{ restaurants: RestaurantDTO[]; total: number }>;
  findAllPublic(
    page: number,
    limit: number,
    searchTerm?: string
  ): Promise<{ restaurants: RestaurantDTO[]; total: number }>;
}

@injectable()
export class RestaurantRepository extends BaseRepository<RestaurantDTO> implements IRestaurantRepository {
  constructor() {
    super(Restaurant);
  }

  protected transformDocument(doc: any): RestaurantDTO {
    const { _id, createdAt, updatedAt, __v, ...rest } = doc;
    return {
      ...rest,
      id: _id.toString(),
      createdAt: new Date(createdAt).toISOString(),
      updatedAt: new Date(updatedAt).toISOString(),
    } as RestaurantDTO;
  }

  private toMongooseData(data: Partial<RestaurantDTO>): Partial<IRestaurant> {
    const { createdAt, updatedAt, ...rest } = data;
    return {
      ...rest,
      createdAt: createdAt ? new Date(createdAt) : undefined,
      updatedAt: updatedAt ? new Date(updatedAt) : undefined,
    };
  }

  async findAllByUserId(
    userId: string,
    page: number,
    limit: number,
    searchTerm?: string
  ): Promise<{ restaurants: RestaurantDTO[]; total: number }> {
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

    return { restaurants: restaurants.map(doc => this.transformDocument(doc)), total };
  }

  async findAllPublic(
    page: number,
    limit: number,
    searchTerm?: string
  ): Promise<{ restaurants: RestaurantDTO[]; total: number }> {
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
      .sort({createdAt:-1})
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();

    return { restaurants: restaurants.map(doc => this.transformDocument(doc)), total };
  }

  async create(data: Partial<RestaurantDTO>): Promise<RestaurantDTO> {
    const mongooseData = this.toMongooseData(data);
    const doc = await this.model.create(mongooseData);
    return this.transformDocument(doc.toObject());
  }

  async update(id: string, data: Partial<RestaurantDTO>): Promise<RestaurantDTO | null> {
    const mongooseData = this.toMongooseData(data);
    const doc = await this.model.findByIdAndUpdate(id, mongooseData, { new: true }).lean().exec();
    return doc ? this.transformDocument(doc) : null;
  }
}