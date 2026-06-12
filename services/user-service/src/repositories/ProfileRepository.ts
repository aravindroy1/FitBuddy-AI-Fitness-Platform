import { ProfileModel, IProfile } from '../models/Profile.js';

export interface IProfileRepository {
  findByUserId(userId: string): Promise<IProfile | null>;
  create(profile: Partial<IProfile>): Promise<IProfile>;
  updateByUserId(userId: string, updates: Partial<IProfile>): Promise<IProfile | null>;
}

export class ProfileRepository implements IProfileRepository {
  async findByUserId(userId: string): Promise<IProfile | null> {
    return ProfileModel.findOne({ userId }).exec();
  }

  async create(profile: Partial<IProfile>): Promise<IProfile> {
    const newProfile = new ProfileModel(profile);
    return newProfile.save();
  }

  async updateByUserId(userId: string, updates: Partial<IProfile>): Promise<IProfile | null> {
    return ProfileModel.findOneAndUpdate({ userId }, updates, { new: true, upsert: true }).exec();
  }
}
