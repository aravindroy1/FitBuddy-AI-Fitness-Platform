import mongoose, { Schema, Document } from 'mongoose';

export interface IProgress extends Document {
  userId: string;
  weight: number;
  height: number;
  bmi: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    bmi: { type: Number, required: true }
  },
  {
    timestamps: true
  }
);

export const ProgressModel = mongoose.model<IProgress>('Progress', ProgressSchema);
