import mongoose, { Schema, Document } from 'mongoose';

export interface IExercise {
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  restSeconds: number;
  targetMuscle: string;
}

export interface IWorkout extends Document {
  userId: string;
  type: 'home' | 'gym';
  split: string;
  exercises: IExercise[];
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema({
  name: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: String, required: true },
  weight: { type: String },
  restSeconds: { type: Number, required: true },
  targetMuscle: { type: String, required: true }
});

const WorkoutSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['home', 'gym'], required: true },
    split: { type: String, required: true },
    exercises: [ExerciseSchema]
  },
  {
    timestamps: true
  }
);

export const WorkoutModel = mongoose.model<IWorkout>('Workout', WorkoutSchema);
