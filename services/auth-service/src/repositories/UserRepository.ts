import { UserModel, IUser } from '../models/User.js';

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  create(user: Partial<IUser>): Promise<IUser>;
  update(id: string, updates: Partial<IUser>): Promise<IUser | null>;
}

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).exec();
  }

  async create(user: Partial<IUser>): Promise<IUser> {
    const newUser = new UserModel(user);
    return newUser.save();
  }

  async update(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }
}
