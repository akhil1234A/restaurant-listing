import { z } from 'zod';

export const RestaurantDto = z.object({
  name: z.string().min(1, 'Name is required'),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  description: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  pinCode: z.string().min(1, 'Pin code is required'),
  phoneNumber: z.string().regex(/^\+?\d{10,15}$/, 'Invalid phone number'),
  website: z.string().url().optional().or(z.literal('')),
  openingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  closingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  offersDelivery: z.boolean(),
  offersDineIn: z.boolean(),
  offersPickup: z.boolean(),
});

export type RestaurantDto = z.infer<typeof RestaurantDto>;