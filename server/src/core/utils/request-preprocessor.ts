import { z } from 'zod';
import { RestaurantDto } from '../../core/dtos/restaurant.dto';
import { validate } from '../../core/dtos/validate';

/**
 * Preprocesses restaurant form data
 * @param body Request body
 * @param isPartial Whether this is a partial update
 * @returns Validated restaurant data
 */
export function preprocessRestaurantData<T extends boolean>(
  body: any,
  isPartial: T = false as T
): T extends true ? Partial<z.infer<typeof RestaurantDto>> : z.infer<typeof RestaurantDto> {
  const restaurantDataRaw = {
    ...body,
    categories: typeof body.categories === 'string' 
      ? body.categories 
      : JSON.stringify(body.categories || []),
    description: body.description || undefined,
    website: body.website || undefined,
    phoneNumber: isPartial ? body.phoneNumber || undefined : body.phoneNumber,
    openingTime: isPartial ? body.openingTime || undefined : body.openingTime,
    closingTime: isPartial ? body.closingTime || undefined : body.closingTime,
    offersDelivery: body.offersDelivery ?? (isPartial ? undefined : 'false'),
    offersDineIn: body.offersDineIn ?? (isPartial ? undefined : 'false'),
    offersPickup: body.offersPickup ?? (isPartial ? undefined : 'false'),
  };

  return validate(
    restaurantDataRaw, 
    isPartial ? RestaurantDto.partial() : RestaurantDto
  ) as T extends true ? Partial<z.infer<typeof RestaurantDto>> : z.infer<typeof RestaurantDto>;
}