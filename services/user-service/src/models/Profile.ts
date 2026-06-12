import mongoose, { Schema, Document } from 'mongoose';

export interface IProfile extends Document {
  userId: string;
  height: number;
  weight: number;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  fitnessGoal: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'body_recomposition';
  age: number;
  gender: 'male' | 'female' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'],
      required: true
    },
    fitnessGoal: {
      type: String,
      enum: ['weight_loss', 'weight_gain', 'muscle_gain', 'body_recomposition'],
      required: true
    },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true }
  },
  {
    timestamps: true
  }
);

export const ProfileModel = mongoose.model<IProfile>('Profile', ProfileSchema);
