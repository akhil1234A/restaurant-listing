import { injectable } from 'inversify';
import { User, IUser } from '../models/user.model';
import { CustomError } from '../../core/errors/custom-error';
import { BaseRepository } from './base.repository';
import { IBaseRepository } from '../../core/interfaces/base.repository';

export interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
}

@injectable()
export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email }).exec();
  }

  async findById(id: string): Promise<IUser | null> {
      const user = await this.model.findById(id).exec();
      if(!user) return null;
      return {
        id: user._id.toString(),
        email: user.email,
        password: user.password,
      }
  }
}