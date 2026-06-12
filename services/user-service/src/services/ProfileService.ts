import { ProfileRepository } from '../repositories/ProfileRepository.js';
import { IProfile } from '../models/Profile.js';

export class ProfileService {
  private profileRepository = new ProfileRepository();

  async getProfile(userId: string): Promise<IProfile> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }
    return profile;
  }

  async updateProfile(userId: string, profileData: Partial<IProfile>): Promise<IProfile> {
    const updated = await this.profileRepository.updateByUserId(userId, profileData);
    if (!updated) {
      throw new Error('Failed to update profile');
    }
    return updated;
  }

  async createProfile(userId: string, profileData: Partial<IProfile>): Promise<IProfile> {
    const existing = await this.profileRepository.findByUserId(userId);
    if (existing) {
      throw new Error('Profile already exists');
    }
    return this.profileRepository.create({ ...profileData, userId });
  }
}
