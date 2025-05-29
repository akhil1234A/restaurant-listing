import { RestaurantInputDto } from '../dtos/restaurant.dto';
import { validate } from '../dtos/validate';
import { z } from 'zod';
import { CustomError } from '../errors/custom-error';

type RestaurantDataRaw = {
  [key: string]: any;
  categories: string;
  description?: string;
  website?: string;
  phoneNumber?: string;
  openingTime?: string;
  closingTime?: string;
  offersDelivery?: string | boolean;
  offersDineIn?: string | boolean;
  offersPickup?: string | boolean;
  latitude?: number;
  longitude?: number;
};

/**
 * Preprocesses restaurant form data to ensure compatibility with RestaurantInputDto.
 * @param body Request body from FormData.
 * @param isPartial Whether this is a partial update.
 * @returns Validated restaurant data.
 * @throws CustomError if categories parsing fails or coordinates are invalid.
 */
export function preprocessRestaurantData<T extends boolean>(
  body: any,
  isPartial: T = false as T
): T extends true ? Partial<z.infer<typeof RestaurantInputDto>> : z.infer<typeof RestaurantInputDto> {
  let categories: string;
  try {
    if (!body.categories) {
      categories = JSON.stringify(isPartial ? [] : []);
    } else if (typeof body.categories === 'string') {
      try {
        const parsed = JSON.parse(body.categories);
        if (Array.isArray(parsed)) {
          if (parsed.every((item: any) => typeof item === 'string')) {
            categories = JSON.stringify(parsed);
          } else {
            throw new Error('Categories must be an array of strings');
          }
        } else {
          categories = JSON.stringify([body.categories]);
        }
      } catch (error) {
        categories = JSON.stringify([body.categories]);
      }
    } else if (Array.isArray(body.categories)) {
      categories = JSON.stringify(body.categories);
    } else {
      throw new Error('Invalid categories format');
    }
  } catch (error) {
    const err = error as Error;
    throw new CustomError(`Invalid categories format: ${err.message}`, 400);
  }

  const restaurantDataRaw: RestaurantDataRaw = {
    ...body,
    categories,
    description: body.description || undefined,
    website: body.website || undefined,
    phoneNumber: isPartial ? body.phoneNumber || undefined : body.phoneNumber,
    openingTime: isPartial ? body.openingTime || undefined : body.openingTime,
    closingTime: isPartial ? body.closingTime || undefined : body.closingTime,
    offersDelivery:
      body.offersDelivery === 'true' || body.offersDelivery === true ? true : isPartial ? undefined : false,
    offersDineIn: body.offersDineIn === 'true' || body.offersDineIn === true ? true : isPartial ? undefined : false,
    offersPickup: body.offersPickup === 'true' || body.offersPickup === true ? true : isPartial ? undefined : false,
    latitude: body.latitude ? parseFloat(body.latitude) : isPartial ? undefined : 0,
    longitude: body.longitude ? parseFloat(body.longitude) : isPartial ? undefined : 0,
  };

  // Validate coordinates for non-partial updates
  if (!isPartial && (isNaN(restaurantDataRaw.latitude!) || isNaN(restaurantDataRaw.longitude!))) {
    throw new CustomError('Invalid latitude or longitude', 400);
  }

  return validate(
    restaurantDataRaw,
    isPartial ? RestaurantInputDto.partial() : RestaurantInputDto
  ) as T extends true ? Partial<z.infer<typeof RestaurantInputDto>> : z.infer<typeof RestaurantInputDto>;
}