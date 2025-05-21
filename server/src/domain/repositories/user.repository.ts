import { injectable } from 'inversify';
import { User, IUser } from '../models/user.model';
import { CustomError } from '../../core/errors/custom-error';

@injectable()
export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async create(data: { email: string; password: string }): Promise<IUser> {
    const user = new User(data);
    return user.save();
  }
}