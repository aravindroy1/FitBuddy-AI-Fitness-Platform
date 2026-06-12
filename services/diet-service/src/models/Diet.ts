import mongoose, { Schema, Document } from 'mongoose';

export interface IMeal {
  name: string;
  foodItems: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface IDiet extends Document {
  userId: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: IMeal[];
  createdAt: Date;
  updatedAt: Date;
}

const MealSchema = new Schema({
  name: { type: String, required: true },
  foodItems: [{ type: String, required: true }],
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true }
});

const DietSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    meals: [MealSchema]
  },
  {
    timestamps: true
  }
);

export const DietModel = mongoose.model<IDiet>('Diet', DietSchema);
