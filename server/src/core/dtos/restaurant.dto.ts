import { z } from 'zod';

export const RestaurantInputDto = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').trim(),
  categories: z
    .string()
    .min(1, 'Categories cannot be empty')
    .transform((val) => {
      try {
        const parsed = JSON.parse(val);
        if (!Array.isArray(parsed)) {
          throw new Error('Categories must be an array');
        }
        return parsed;
      } catch (error) {
        const err = error as Error;
        throw new Error(`Invalid categories format: ${err.message}`);
      }
    })
    .pipe(z.string().array().nonempty('At least one category required')),
  description: z.string().optional(),
  address: z.string().min(5, 'Address must be at least 5 characters').trim(),
  city: z.string().min(2, 'City must be at least 2 characters').trim(),
  pinCode: z.string().regex(/^\d{5,10}$/, 'Pin code must be 5-10 digits'),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  website: z.string().url('Invalid URL').optional(),
  openingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  closingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  offersDelivery: z.boolean().default(false),
  offersDineIn: z.boolean().default(false),
  offersPickup: z.boolean().default(false),
  latitude: z.number().min(-90, 'Invalid latitude').max(90, 'Invalid latitude'),
  longitude: z.number().min(-180, 'Invalid longitude').max(180, 'Invalid longitude'),
});

export interface RestaurantDTO {
  id: string;
  name: string;
  categories: string[];
  description?: string;
  address: string;
  city: string;
  pinCode: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
  website?: string;
  openingTime: string;
  closingTime: string;
  images: string[];
  offersDelivery: boolean;
  offersDineIn: boolean;
  offersPickup: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}