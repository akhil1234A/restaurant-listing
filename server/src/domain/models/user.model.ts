import mongoose, { Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);