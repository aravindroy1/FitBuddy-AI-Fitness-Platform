import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import {
  Dumbbell, Sparkles, Home, Building, Clock, Flame, ChevronRight, Info
} from 'lucide-react';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  restSeconds: number;
  targetMuscle: string;
}

interface WorkoutPlan {
  type: 'home' | 'gym';
  split: string;
  exercises: Exercise[];
}

export const WorkoutPlanner: React.FC = () => {
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [workoutType, setWorkoutType] = useState<'home' | 'gym'>('gym');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const workoutRes = await api.workout.getLatest();
      setWorkout(workoutRes.data);
      if (workoutRes.data) {
        setWorkoutType(workoutRes.data.type);
      }
    } catch (err) {
      // Setup Mock Initial state
    }

    try {
      const profileRes = await api.profile.get();
      setProfile(profileRes.data);
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateWorkout = async () => {
    setLoading(true);
    setError('');

    const goal = profile?.fitnessGoal || 'muscle_gain';
    try {
      const res = await api.workout.generate(workoutType, goal);
      setWorkout(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to contact AI Foundry. Loaded calculated local plan.');
      // Local fallback routine
      const calculatedWorkout: WorkoutPlan = {
        type: workoutType,
        split: workoutType === 'gym' ? 'Full Body Hypertrophy' : 'Bodyweight HIIT Circuit',
        exercises: workoutType === 'gym' ? [
          { name: 'Dumbbell Bench Press', sets: 4, reps: '10', weight: '24kg each', restSeconds: 90, targetMuscle: 'Chest' },
          { name: 'Lat Pulldown', sets: 4, reps: '12', weight: '55kg', restSeconds: 60, targetMuscle: 'Back' },
          { name: 'Leg Press', sets: 3, reps: '12', weight: '120kg', restSeconds: 90, targetMuscle: 'Legs' },
          { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10', weight: '16kg each', restSeconds: 75, targetMuscle: 'Shoulders' }
        ] : [
          { name: 'Bodyweight Squats', sets: 4, reps: '20', restSeconds: 45, targetMuscle: 'Legs' },
          { name: 'Push-Ups', sets: 4, reps: '15', restSeconds: 45, targetMuscle: 'Chest' },
          { name: 'Glute Bridges', sets: 3, reps: '20', restSeconds: 30, targetMuscle: 'Glutes' },
          { name: 'Bicycle Crunches', sets: 3, reps: '45 sec', restSeconds: 30, targetMuscle: 'Core' }
        ]
      };
      setWorkout(calculatedWorkout);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Dumbbell className="h-7 w-7 text-primary" /> Workout Planner
          </h1>
          <p className="text-slate-400 text-sm mt-1">Design daily schedules mapping sets, reps, and weights</p>
        </div>

        <div className="flex gap-2">
          {/* Toggle Buttons */}
          <div className="bg-slate-900/50 p-1.5 border border-white/5 rounded-xl flex">
            <button
              onClick={() => setWorkoutType('home')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                workoutType === 'home'
                  ? 'bg-primary text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home className="h-3.5 w-3.5" /> Home
            </button>
            <button
              onClick={() => setWorkoutType('gym')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                workoutType === 'gym'
                  ? 'bg-primary text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building className="h-3.5 w-3.5" /> Gym
            </button>
          </div>

          <button
            onClick={handleGenerateWorkout}
            disabled={loading}
            className="bg-gradient-to-r from-primary to-accent-cyan hover:brightness-110 active:brightness-95 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all text-sm shadow-md shadow-primary/20"
          >
            <Sparkles className="h-4 w-4" /> {loading ? 'Compiling Routine...' : 'Generate Plan'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 text-sm flex items-start gap-2">
          <Info className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {workout ? (
        <div className="space-y-6">
          {/* Split Details Banner */}
          <div className="glass-panel p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                <Dumbbell className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">{workout.split}</h4>
                <p className="text-xs text-slate-400 capitalize">{workout.type} environment split</p>
              </div>
            </div>
            <div className="flex gap-4 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 px-3 py-2 rounded-xl">
                <Clock className="h-4 w-4 text-accent-cyan" />
                <span>~60 Mins Session</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 px-3 py-2 rounded-xl">
                <Flame className="h-4 w-4 text-accent-rose" />
                <span>High Intensity</span>
              </div>
            </div>
          </div>

          {/* Exercises list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workout.exercises.map((ex, idx) => (
              <div key={idx} className="glass-panel p-5 flex items-center justify-between border-l-4 border-l-primary relative overflow-hidden group">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                    {ex.targetMuscle}
                  </span>
                  <h4 className="font-bold text-white text-base group-hover:text-primary transition-colors">
                    {ex.name}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                    <span className="bg-white/5 px-2 py-1 rounded border border-white/5">{ex.sets} Sets</span>
                    <span className="bg-white/5 px-2 py-1 rounded border border-white/5">{ex.reps} Reps</span>
                    {ex.weight && <span className="bg-white/5 px-2 py-1 rounded border border-white/5">{ex.weight}</span>}
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Rest Time</div>
                  <div className="text-sm font-bold text-slate-300 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{ex.restSeconds}s</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-panel p-10 text-center space-y-4">
          <div className="inline-flex p-4 bg-primary/10 rounded-full border border-primary/20 text-primary">
            <Dumbbell className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No Active Workout Split</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Choose either Home or Gym from the selector and click "Generate Plan" to compile target muscle routines using AI.
          </p>
        </div>
      )}
    </div>
  );
};
