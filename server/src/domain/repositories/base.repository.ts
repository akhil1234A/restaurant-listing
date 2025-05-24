import { Model } from 'mongoose';
import { IBaseRepository } from '../../core/interfaces/base.repository';

export abstract class BaseRepository<T> implements IBaseRepository<T> {
  protected model: Model<any>;

  constructor(model: Model<any>) {
    this.model = model;
  }

  async findById(id: string): Promise<T | null> {
    const doc = await this.model.findById(id).lean().exec();
    return doc ? this.transformDocument(doc) : null;
  }

  async create(data: Partial<T>): Promise<T> {
    const doc = await this.model.create(data);
    return this.transformDocument(doc.toObject());
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const doc = await this.model.findByIdAndUpdate(id, data, { new: true }).lean().exec();
    return doc ? this.transformDocument(doc) : null;
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  protected transformDocument(doc: any): T {
    return doc;
  }
}