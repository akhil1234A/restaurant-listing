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
    .string()
    .min(1, "At least one category required")
    .transform((val) => {
      try {
        const parsed = JSON.parse(val)
        if (!Array.isArray(parsed)) throw new Error("Categories must be an array")
        return parsed
      } catch {
        throw new Error("Invalid categories format")
      }
    })
    .pipe(z.array(z.string().min(1, "Category cannot be empty"))),
  description: z.string().trim().optional(),
  website: z.string().trim().url("Invalid URL").optional(),
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
  offersDelivery: z.boolean().default(false),
  offersDineIn: z.boolean().default(false),
  offersPickup: z.boolean().default(false),
})

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
  categories: string[]
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
