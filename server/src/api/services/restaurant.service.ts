import { injectable, inject } from 'inversify';
import { TYPES } from '../../di/types';
import { RestaurantRepository } from '../../domain/repositories/restaurant.repository';
import { S3Service } from '../../infrastructure/s3/s3.service';
import { RestaurantDto } from '../../core/dtos/restaurant.dto';
import { CustomError } from '../../core/errors/custom-error';
import { Client } from '@googlemaps/google-maps-services-js';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class RestaurantService {
  private googleMapsClient: Client;

  constructor(
    @inject(TYPES.RestaurantRepository) private restaurantRepository: RestaurantRepository,
    @inject(TYPES.S3Service) private s3Service: S3Service
  ) {
    this.googleMapsClient = new Client({});
  }

  async geocodeAddress(address: string, city: string, pinCode: string): Promise<{ latitude: number; longitude: number }> {
    try {
      const response = await this.googleMapsClient.geocode({
        params: {
          address: `${address}, ${city}, ${pinCode}`,
          key: process.env.GOOGLE_MAPS_API_KEY!,
        },
      });
      const location = response.data.results[0]?.geometry.location;
      if (!location) {
        throw new CustomError('Unable to geocode address', 400);
      }
      return { latitude: location.lat, longitude: location.lng };
    } catch (error) {
      throw new CustomError('Geocoding failed', 400);
    }
  }

  async getRestaurants(userId: string, page: number, limit: number, search?: string) {
    return this.restaurantRepository.findByUserId(userId, page, limit, search);
  }

  async createRestaurant(
    userId: string,
    data: RestaurantDto,
    files: Express.Multer.File[]
  ): Promise<any> {
    if (files.length < 3) {
      throw new CustomError('At least 3 images are required', 400);
    }

    const { latitude, longitude } = await this.geocodeAddress(data.address, data.city, data.pinCode);

    const imageUrls: string[] = [];
    for (const file of files) {
      const key = `restaurants/${userId}/${uuidv4()}.jpg`;
      await this.s3Service.uploadImage(file, key);
      const url = await this.s3Service.getSignedUrl(key);
      imageUrls.push(url);
    }

    const restaurantData = {
      ...data,
      latitude,
      longitude,
      images: imageUrls,
      userId,
    };

    return this.restaurantRepository.create(restaurantData);
  }

  async updateRestaurant(
    id: string,
    userId: string,
    data: Partial<RestaurantDto>,
    files?: Express.Multer.File[]
  ): Promise<any> {
    const restaurant = await this.restaurantRepository.findById(id);
    if (!restaurant || restaurant.userId !== userId) {
      throw new CustomError('Restaurant not found or unauthorized', 404);
    }

    const updateData: Partial<any> = { ...data };

    if (data.address || data.city || data.pinCode) {
      const { latitude, longitude } = await this.geocodeAddress(
        data.address || restaurant.address,
        data.city || restaurant.city,
        data.pinCode || restaurant.pinCode
      );
      updateData.latitude = latitude;
      updateData.longitude = longitude;
    }

    if (files && files.length > 0) {
      if (files.length < 3 && files.length + (restaurant.images.length || 0) < 3) {
        throw new CustomError('At least 3 images are required', 400);
      }
      const newImageUrls: string[] = [];
      for (const file of files) {
        const key = `restaurants/${userId}/${uuidv4()}.jpg`;
        await this.s3Service.uploadImage(file, key);
        const url = await this.s3Service.getSignedUrl(key);
        newImageUrls.push(url);
      }
      updateData.images = newImageUrls.length >= 3 ? newImageUrls : [...restaurant.images, ...newImageUrls];
    }

    return this.restaurantRepository.update(id, updateData);
  }

  async deleteRestaurant(id: string, userId: string): Promise<void> {
    const restaurant = await this.restaurantRepository.findById(id);
    if (!restaurant || restaurant.userId !== userId) {
      throw new CustomError('Restaurant not found or unauthorized', 404);
    }
    await this.restaurantRepository.delete(id);
  }
}