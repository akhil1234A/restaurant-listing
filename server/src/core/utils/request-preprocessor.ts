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
};

/**
 * Preprocesses restaurant form data to ensure compatibility with RestaurantInputDto.
 * @param body Request body from FormData.
 * @param isPartial Whether this is a partial update.
 * @returns Validated restaurant data.
 * @throws CustomError if categories parsing fails.
 */
export function preprocessRestaurantData<T extends boolean>(
  body: any,
  isPartial: T = false as T
): T extends true ? Partial<z.infer<typeof RestaurantInputDto>> : z.infer<typeof RestaurantInputDto> {
  let categories: string;
  try {
    if (!body.categories) {
      // Handle missing or empty categories
      categories = JSON.stringify(isPartial ? [] : []);
    } else if (typeof body.categories === 'string') {
      try {
        const parsed = JSON.parse(body.categories);
        if (Array.isArray(parsed)) {
          // Ensure parsed value is an array of strings
          if (parsed.every((item: any) => typeof item === 'string')) {
            categories = JSON.stringify(parsed);
          } else {
            throw new Error('Categories must be an array of strings');
          }
        } else {
          // Treat non-array as a single category
          categories = JSON.stringify([body.categories]);
        }
      } catch (error) {
        // If JSON parsing fails, treat as a single category
        categories = JSON.stringify([body.categories]);
      }
    } else if (Array.isArray(body.categories)) {
      // Handle array input (unlikely from FormData, but for robustness)
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
    offersDelivery: body.offersDelivery === 'true' || body.offersDelivery === true ? true : (isPartial ? undefined : false),
    offersDineIn: body.offersDineIn === 'true' || body.offersDineIn === true ? true : (isPartial ? undefined : false),
    offersPickup: body.offersPickup === 'true' || body.offersPickup === true ? true : (isPartial ? undefined : false),
  };

  return validate(
    restaurantDataRaw,
    isPartial ? RestaurantInputDto.partial() : RestaurantInputDto
  ) as T extends true ? Partial<z.infer<typeof RestaurantInputDto>> : z.infer<typeof RestaurantInputDto>;
}