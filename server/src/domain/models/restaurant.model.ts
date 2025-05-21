import mongoose, { Schema, Document } from 'mongoose';

export interface IRestaurant extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSchema = new Schema<IRestaurant>({
  name: { type: String, required: true },
  categories: { type: [String], required: true },
  description: { type: String },
  address: { type: String, required: true },
  city: { type: String, required: true },
  pinCode: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  phoneNumber: { type: String, required: true },
  website: { type: String },
  openingTime: { type: String, required: true },
  closingTime: { type: String, required: true },
  images: { type: [String], required: true, validate: (v: string[]) => v.length >= 3 },
  offersDelivery: { type: Boolean, default: false },
  offersDineIn: { type: Boolean, default: false },
  offersPickup: { type: Boolean, default: false },
  userId: { type: String, required: true },
}, { timestamps: true });

export const Restaurant = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);