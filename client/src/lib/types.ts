import { z } from "zod"

export const restaurantSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").trim(),
  address: z.string().min(5, "Address must be at least 5 characters").trim(),
  city: z.string().min(2, "City must be at least 2 characters").trim(),
  pinCode: z
    .string()
    .regex(/^\d{5,10}$/, "Pin code must be 5-10 digits")
    .trim(),
  categories: z
    .array(z.enum(['restaurant', 'cafe', 'hotel', 'vegetarian']))
    .min(1, "At least one category required"),
  description: z.string().trim().optional(),
  website: z.string().trim().url("Invalid URL").optional().or(z.literal('')),
  phoneNumber: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be 10 digits")
    .trim(),
  openingTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Opening time must be HH:MM")
    .trim(),
  closingTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Closing time must be HH:MM")
    .trim(),
  offersDelivery: z.boolean(),
  offersDineIn: z.boolean(),
  offersPickup: z.boolean(),
  latitude: z.number().min(-90, 'Invalid latitude').max(90, 'Invalid latitude'),
  longitude: z.number().min(-180, 'Invalid longitude').max(180, 'Invalid longitude'),
})

export type Category = 'restaurant' | 'cafe' | 'hotel' | 'vegetarian';

export const loginSchema = z.object({
  email: z.string().email("Invalid email").trim(),
  password: z.string().min(6, "Password must be at least 6 characters").trim(),
})

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").trim(),
    email: z.string().email("Invalid email").trim(),
    password: z.string().min(6, "Password must be at least 6 characters").trim(),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters").trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type RestaurantFormData = z.infer<typeof restaurantSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>

export interface User {
  id: string
  email: string
  name?: string
}

export interface Restaurant {
  id: string
  name: string
  categories: Category[]
  description?: string
  address: string
  city: string
  pinCode: string
  latitude: number
  longitude: number
  phoneNumber: string
  website?: string
  openingTime: string
  closingTime: string
  images: string[]
  offersDelivery: boolean
  offersDineIn: boolean
  offersPickup: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface RestaurantResponse {
  restaurants: Restaurant[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}