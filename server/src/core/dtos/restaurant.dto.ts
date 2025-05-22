import { z } from 'zod';

export const RestaurantDto = z.object({
  name: z.string().min(3, 'Restaurant name must be at least 3 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  pinCode: z.string().regex(/^\d{5,10}$/, 'Pin code must be 5-10 digits'),
  categories: z
    .string()
    .transform((val) => {
      try {
        const parsed = JSON.parse(val);
        if (!Array.isArray(parsed)) {
          throw new Error('Categories must be an array');
        }
        return parsed;
      } catch {
        throw new Error('Invalid categories format');
      }
    })
    .pipe(z.array(z.string().min(1, 'Category cannot be empty')).min(1, 'At least one category is required')),
  description: z.string().optional(),
  website: z.string().url('Website must be a valid URL').optional(),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  openingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Opening time must be in HH:MM format'),
  closingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Closing time must be in HH:MM format'),
  offersDelivery: z
    .string()
    .transform((val) => val.toLowerCase() === 'true')
    .pipe(z.boolean())
    .default('false'),
  offersDineIn: z
    .string()
    .transform((val) => val.toLowerCase() === 'true')
    .pipe(z.boolean())
    .default('false'),
  offersPickup: z
    .string()
    .transform((val) => val.toLowerCase() === 'true')
    .pipe(z.boolean())
    .default('false'),
});

export type RestaurantDtoType = z.infer<typeof RestaurantDto>;