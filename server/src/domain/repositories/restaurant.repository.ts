import { injectable } from 'inversify';
import { Restaurant, IRestaurant } from '../models/restaurant.model';
import { CustomError } from '../../core/errors/custom-error';

@injectable()
export class RestaurantRepository {
  async findByUserId(
    userId: string,
    page: number,
    limit: number,
    search?: string
  ): Promise<{ restaurants: IRestaurant[]; total: number }> {
    const query: any = { userId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { categories: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Restaurant.countDocuments(query);
    const restaurants = await Restaurant.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return { restaurants, total };
  }

  async findById(id: string): Promise<IRestaurant | null> {
    return Restaurant.findById(id);
  }

  async create(data: Partial<IRestaurant>): Promise<IRestaurant> {
    const restaurant = new Restaurant(data);
    return restaurant.save();
  }

  async update(id: string, data: Partial<IRestaurant>): Promise<IRestaurant | null> {
    return Restaurant.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<void> {
    await Restaurant.findByIdAndDelete(id);
  }
}