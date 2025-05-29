import { injectable, inject } from 'inversify';
import { TYPES } from '../../di/types';
import { IRestaurantRepository } from '../../domain/repositories/restaurant.repository';
import { S3Service } from '../../infrastructure/s3/s3.service';
import { CustomError } from '../../core/errors/custom-error';
import { RestaurantDTO, RestaurantInputDto } from '../../core/dtos/restaurant.dto';
import { Client } from '@googlemaps/google-maps-services-js';
import { z } from 'zod';
import { Logger } from '../../infrastructure/logging/logger';

export interface IRestaurantService {
  convertAddressToCoordinates(
    address: string,
    city: string,
    pinCode: string
  ): Promise<{ latitude: number; longitude: number }>;
  fetchAllRestaurants(
    userId: string,
    page: number,
    limit: number,
    searchTerm?: string
  ): Promise<{ restaurants: RestaurantDTO[]; total: number }>;
  fetchAllRestaurantsPublic(
    page: number,
    limit: number,
    searchTerm?: string
  ): Promise<{ restaurants: RestaurantDTO[]; total: number }>;
  getRestaurantById(id: string): Promise<RestaurantDTO>;
  createNewRestaurant(
    userId: string,
    data: z.infer<typeof RestaurantInputDto>,
    imageFiles: Express.Multer.File[]
  ): Promise<RestaurantDTO>;
  updateExistingRestaurant(
    id: string,
    userId: string,
    data: Partial<z.infer<typeof RestaurantInputDto>>,
    imageFiles?: Express.Multer.File[],
    imagesToKeep?: string[],
    imagesToRemove?: string[]
  ): Promise<RestaurantDTO>;
  deleteRestaurantById(id: string, userId: string): Promise<void>;
}

@injectable()
export class RestaurantService implements IRestaurantService {
  private googleMapsClient: Client;

  constructor(
    @inject(TYPES.RestaurantRepository)
    private restaurantRepository: IRestaurantRepository,
    @inject(TYPES.S3Service) private s3Service: S3Service
  ) {
    this.googleMapsClient = new Client({});
  }

  async convertAddressToCoordinates(
    address: string,
    city: string,
    pinCode: string
  ): Promise<{ latitude: number; longitude: number }> {
    try {
      if (!address || !city || !pinCode) {
        Logger.error('Invalid geocoding inputs', { address, city, pinCode });
        throw new CustomError('Address, city, and pin code are required', 400);
      }

      if (!process.env.GOOGLE_MAPS_API_KEY) {
        Logger.error('Google Maps API key is missing');
        throw new CustomError(
          'Server configuration error: Missing Google Maps API key',
          500
        );
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
        throw new CustomError(
          `Geocoding failed: ${response.data.status} - ${response.data.error_message || 'Unknown error'}`,
          400
        );
      }

      const location = response.data.results[0]?.geometry.location;
      if (!location) {
        Logger.error('No geocoding results found', {
          address: fullAddress,
          response: response.data,
        });
        throw new CustomError(
          'Unable to geocode address: No results found',
          400
        );
      }

      Logger.info('Geocoding successful', {
        address: fullAddress,
        latitude: location.lat,
        longitude: location.lng,
      });
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
      throw new CustomError(
        `Geocoding failed: ${error.message || 'Unknown error'}`,
        400
      );
    }
  }

  async fetchAllRestaurants(
    userId: string,
    page: number,
    limit: number,
    searchTerm?: string
  ): Promise<{ restaurants: RestaurantDTO[]; total: number }> {
    const result = await this.restaurantRepository.findAllByUserId(
      userId,
      page,
      limit,
      searchTerm
    );
    const restaurants = await Promise.all(
      result.restaurants.map(async (restaurant) => ({
        ...restaurant,
        images: await Promise.all(
          restaurant.images.map((key) => this.s3Service.getSignedUrl(key))
        ),
      }))
    );
    return { restaurants, total: result.total };
  }

  async fetchAllRestaurantsPublic(
    page: number,
    limit: number,
    searchTerm?: string
  ): Promise<{ restaurants: RestaurantDTO[]; total: number }> {
    const result = await this.restaurantRepository.findAllPublic(
      page,
      limit,
      searchTerm
    );
    const restaurants = await Promise.all(
      result.restaurants.map(async (restaurant) => ({
        ...restaurant,
        images: await Promise.all(
          restaurant.images.map((key) => this.s3Service.getSignedUrl(key))
        ),
      }))
    );
    return { restaurants, total: result.total };
  }

  async getRestaurantById(id: string): Promise<RestaurantDTO> {
    const restaurant = await this.restaurantRepository.findById(id);
    if (!restaurant) {
      throw new CustomError('Restaurant not found', 404);
    }
    const images = await Promise.all(
      restaurant.images.map((key) => this.s3Service.getSignedUrl(key))
    );
    return { ...restaurant, images };
  }

  async createNewRestaurant(
    userId: string,
    data: z.infer<typeof RestaurantInputDto>,
    imageFiles: Express.Multer.File[]
  ): Promise<RestaurantDTO> {
    // Validate provided coordinates
    if (data.latitude < -90 || data.latitude > 90 || data.longitude < -180 || data.longitude > 180) {
      throw new CustomError('Invalid latitude or longitude', 400);
    }

    const imageKeys = await Promise.all(
      imageFiles.map(async (file, index) => {
        const key = `restaurants/${userId}/${Date.now()}_${index}.jpg`;
        await this.s3Service.uploadImage(file, key);
        return key;
      })
    );

    const restaurantData: Partial<RestaurantDTO> = {
      ...data,
      userId,
      images: imageKeys,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const restaurant = await this.restaurantRepository.create(restaurantData);
    const images = await Promise.all(
      restaurant.images.map((key) => this.s3Service.getSignedUrl(key))
    );
    return { ...restaurant, images };
  }

  async updateExistingRestaurant(
    id: string,
    userId: string,
    data: Partial<z.infer<typeof RestaurantInputDto>>,
    imageFiles: Express.Multer.File[] = [],
    imagesToKeep: string[] = [],
    imagesToRemove: string[] = []
  ): Promise<RestaurantDTO> {
    const restaurant = await this.restaurantRepository.findById(id);
    if (!restaurant) {
      throw new CustomError('Restaurant not found', 404);
    }
    if (restaurant.userId !== userId) {
      throw new CustomError('Unauthorized', 403);
    }

    // Validate coordinates if provided
    if (data.latitude !== undefined && data.longitude !== undefined) {
      if (data.latitude < -90 || data.latitude > 90 || data.longitude < -180 || data.longitude > 180) {
        throw new CustomError('Invalid latitude or longitude', 400);
      }
    }

    // Use existing coordinates if not provided
    const latitude = data.latitude !== undefined ? data.latitude : restaurant.latitude;
    const longitude = data.longitude !== undefined ? data.longitude : restaurant.longitude;

    // Extract keys from signed URLs
    const keptImageKeys = await Promise.all(
      imagesToKeep.map(async (signedUrl) => {
        return await this.s3Service.extractKeyFromSignedUrl(signedUrl);
      })
    );

    // Delete removed images
    await Promise.all(
      imagesToRemove.map((key) => this.s3Service.deleteImage(key))
    );

    // Upload new images
    const newImageKeys = await Promise.all(
      imageFiles.map(async (file, index) => {
        const key = `restaurants/${userId}/${Date.now()}_${index}.jpg`;
        await this.s3Service.uploadImage(file, key);
        return key;
      })
    );

    // Combine kept and new images
    const updatedImages = [...keptImageKeys, ...newImageKeys];

    const updateData: Partial<RestaurantDTO> = {
      ...data,
      latitude,
      longitude,
      images: updatedImages,
      updatedAt: new Date().toISOString(),
    };

    const updatedRestaurant = await this.restaurantRepository.update(id, updateData);
    if (!updatedRestaurant) {
      throw new CustomError('Failed to update restaurant', 500);
    }

    const images = await Promise.all(
      updatedRestaurant.images.map((key) => this.s3Service.getSignedUrl(key))
    );
    return { ...updatedRestaurant, images };
  }

  async deleteRestaurantById(id: string, userId: string): Promise<void> {
    const restaurant = await this.restaurantRepository.findById(id);
    if (!restaurant) {
      throw new CustomError('Restaurant not found', 404);
    }
    if (restaurant.userId !== userId) {
      throw new CustomError('Unauthorized', 403);
    }

    await Promise.all(
      restaurant.images.map((key) => this.s3Service.deleteImage(key))
    );
    await this.restaurantRepository.delete(id);
  }
}