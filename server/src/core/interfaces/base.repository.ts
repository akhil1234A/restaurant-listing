import { Document } from "mongoose";

export interface IBaseRepository<T extends Document> {
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<void>;
}