import { injectable, inject } from 'inversify';
import { TYPES } from '../../di/types';
import { IRestaurantRepository } from '../../domain/repositories/restaurant.repository';
import { S3Service } from '../../infrastructure/s3/s3.service';
import { RestaurantDto } from '../../core/dtos/restaurant.dto';
import { CustomError } from '../../core/errors/custom-error';
import { Client } from '@googlemaps/google-maps-services-js';
import { v4 as uuidv4 } from 'uuid';
import { IRestaurant } from '../../domain/models/restaurant.model';
import { z } from 'zod';
import { Logger } from '../../infrastructure/logging/logger';

export interface IRestaurantService {
  convertAddressToCoordinates(address: string, city: string, pinCode: string): Promise<{ latitude: number; longitude: number }>;
  fetchAllRestaurants(userId: string, page: number, limit: number, searchTerm?: string): Promise<{ restaurants: IRestaurant[]; total: number }>;
  fetchAllRestaurantsPublic(page: number, limit: number, searchTerm?: string): Promise<{ restaurants: IRestaurant[]; total: number }>;
  createNewRestaurant(userId: string, restaurantData: z.infer<typeof RestaurantDto>, imageFiles: Express.Multer.File[]): Promise<IRestaurant>;
  updateExistingRestaurant(
    restaurantId: string,
    userId: string,
    restaurantData: Partial<z.infer<typeof RestaurantDto>>,
    imageFiles?: Express.Multer.File[]
  ): Promise<IRestaurant>;
  deleteRestaurantById(restaurantId: string, userId: string): Promise<void>;
}

@injectable()
export class RestaurantService implements IRestaurantService {
  private googleMapsClient: Client;

  constructor(
    @inject(TYPES.RestaurantRepository) private restaurantRepository: IRestaurantRepository,
    @inject(TYPES.S3Service) private s3Service: S3Service
  ) {
    this.googleMapsClient = new Client({});
  }

  async convertAddressToCoordinates(address: string, city: string, pinCode: string): Promise<{ latitude: number; longitude: number }> {
    try {
      if (!address || !city || !pinCode) {
        Logger.error('Invalid geocoding inputs', { address, city, pinCode });
        throw new CustomError('Address, city, and pin code are required', 400);
      }

      if (!process.env.GOOGLE_MAPS_API_KEY) {
        Logger.error('Google Maps API key is missing');
        throw new CustomError('Server configuration error: Missing Google Maps API key', 500);
      }

      const fullAddress = `${address}, ${city}, ${pinCode}`;
      Logger.debug('Geocoding address', { fullAddress });

      const response = await this.googleMapsClient.geocode({
        params: {
          address: fullAddress,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      });

      if (response.data.status !== 'OK') {
        Logger.error('Google Maps API error', {
          status: response.data.status,
          error_message: response.data.error_message,
          address: fullAddress,
        });
        throw new CustomError(`Geocoding failed: ${response.data.status} - ${response.data.error_message || 'Unknown error'}`, 400);
      }

      const location = response.data.results[0]?.geometry.location;
      if (!location) {
        Logger.error('No geocoding results found', { address: fullAddress, response: response.data });
        throw new CustomError('Unable to geocode address: No results found', 400);
      }

      Logger.info('Geocoding successful', { address: fullAddress, latitude: location.lat, longitude: location.lng });
      return { latitude: location.lat, longitude: location.lng };
    } catch (error: any) {
      Logger.error('Geocoding exception', {
        error: error.message,
        stack: error.stack,
        address: `${address}, ${city}, ${pinCode}`,
      });
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(`Geocoding failed: ${error.message || 'Unknown error'}`, 400);
    }
  }

  async fetchAllRestaurants(userId: string, page: number, limit: number, searchTerm?: string) {
    return this.restaurantRepository.findAllByUserId(userId, page, limit, searchTerm);
  }

  async fetchAllRestaurantsPublic(page: number, limit: number, searchTerm?: string) {
    return this.restaurantRepository.findAllPublic(page, limit, searchTerm);
  }

  async createNewRestaurant(
    userId: string,
    restaurantData: z.infer<typeof RestaurantDto>,
    imageFiles: Express.Multer.File[]
  ): Promise<IRestaurant> {
    if (imageFiles.length < 3) {
      throw new CustomError('At least 3 images are required', 400);
    }

    const { latitude, longitude } = await this.convertAddressToCoordinates(
      restaurantData.address,
      restaurantData.city,
      restaurantData.pinCode
    );

    const imageUrls: string[] = [];
    for (const file of imageFiles) {
      const key = `restaurants/${userId}/${uuidv4()}.jpg`;
      await this.s3Service.uploadImage(file, key);
      const url = await this.s3Service.getSignedUrl(key);
      imageUrls.push(url);
    }

    const newRestaurant: IRestaurant = {
      ...restaurantData,
      latitude,
      longitude,
      images: imageUrls,
      userId,
      id: '', // Will be set by MongoDB
      createdAt: new Date(),
      updatedAt: new Date(),
    } as IRestaurant;

    return this.restaurantRepository.create(newRestaurant);
  }

  async updateExistingRestaurant(
    restaurantId: string,
    userId: string,
    restaurantData: Partial<z.infer<typeof RestaurantDto>>,
    imageFiles?: Express.Multer.File[]
  ): Promise<IRestaurant> {
    const existingRestaurant = await this.restaurantRepository.findById(restaurantId);
    if (!existingRestaurant || existingRestaurant.userId !== userId) {
      throw new CustomError('Restaurant not found or unauthorized', 404);
    }

    const updatedData: Partial<IRestaurant> = { ...restaurantData };

    if (restaurantData.address || restaurantData.city || restaurantData.pinCode) {
      const { latitude, longitude } = await this.convertAddressToCoordinates(
        restaurantData.address || existingRestaurant.address,
        restaurantData.city || existingRestaurant.city,
        restaurantData.pinCode || existingRestaurant.pinCode
      );
      updatedData.latitude = latitude;
      updatedData.longitude = longitude;
    }

    if (imageFiles && imageFiles.length > 0) {
      if (imageFiles.length < 3 && imageFiles.length + (existingRestaurant.images.length || 0) < 3) {
        throw new CustomError('At least 3 images are required', 400);
      }
      const newImageUrls: string[] = [];
      for (const file of imageFiles) {
        const key = `restaurants/${userId}/${uuidv4()}.jpg`;
        await this.s3Service.uploadImage(file, key);
        const url = await this.s3Service.getSignedUrl(key);
        newImageUrls.push(url);
      }
      updatedData.images = newImageUrls.length >= 3 ? newImageUrls : [...existingRestaurant.images, ...newImageUrls];
    }

    const updatedRestaurant = await this.restaurantRepository.update(restaurantId, updatedData);
    if (!updatedRestaurant) {
      throw new CustomError('Failed to update restaurant', 500);
    }
    return updatedRestaurant;
  }

  async deleteRestaurantById(restaurantId: string, userId: string): Promise<void> {
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (!restaurant || restaurant.userId !== userId) {
      throw new CustomError('Restaurant not found or unauthorized', 404);
    }
    await this.restaurantRepository.delete(restaurantId);
  }
}