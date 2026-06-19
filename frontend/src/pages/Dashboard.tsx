import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import {
  TrendingDown, Award, Flame, Dumbbell, Scale, Activity, Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProgressRecord {
  weight: number;
  bmi: number;
  createdAt: string;
}

export const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [diet, setDiet] = useState<any>(null);
  const [workout, setWorkout] = useState<any>(null);
  const [logWeight, setLogWeight] = useState('');
  const [logHeight, setLogHeight] = useState('');
  const [toast, setToast] = useState('');

  const loadData = async () => {
    try {
      const profileRes = await api.profile.get();
      if (profileRes.data) {
        setProfile(profileRes.data);
        setLogHeight(profileRes.data.height.toString());
      }
    } catch (err) {
      setProfile(null);
    }

    try {
      const progressRes = await api.progress.getHistory();
      setProgress(progressRes.data || []);
    } catch (err) {
      setProgress([]);
    }

    try {
      const dietRes = await api.diet.getLatest();
      setDiet(dietRes.data);
    } catch (err) {
      setDiet(null);
    }

    try {
      const workoutRes = await api.workout.getLatest();
      setWorkout(workoutRes.data);
    } catch (err) {
      setWorkout(null);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logWeight || !logHeight) return;

    try {
      await api.progress.log(Number(logWeight), Number(logHeight));
      setToast('Progress logged successfully!');
      setLogWeight('');
      setTimeout(() => setToast(''), 3000);
      loadData();
    } catch (err) {
      // Local addition fallback if server not running
      const newRec = {
        weight: Number(logWeight),
        bmi: Number((Number(logWeight) / ((Number(logHeight) / 100) ** 2)).toFixed(1)),
        createdAt: new Date().toISOString()
      };
      setProgress(prev => [...prev, newRec]);
      setToast('Mock progress logged (local fallback)!');
      setLogWeight('');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const currentWeight = progress.length > 0 ? progress[progress.length - 1].weight : profile?.weight || 0;
  const currentBmi = progress.length > 0 ? progress[progress.length - 1].bmi : 0;

  const chartData = progress.map(p => ({
    name: new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    Weight: p.weight,
    BMI: p.bmi
  }));

  const macroData = diet ? [
    { name: 'Protein', grams: diet.protein, calories: diet.protein * 4, fill: '#6366f1' },
    { name: 'Carbs', grams: diet.carbs, calories: diet.carbs * 4, fill: '#06b6d4' },
    { name: 'Fat', grams: diet.fat, calories: diet.fat * 9, fill: '#d946ef' }
  ] : [];

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-accent-cyan' };
    if (bmi < 25) return { label: 'Healthy Weight', color: 'text-secondary' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-500' };
    return { label: 'Obese', color: 'text-accent-rose' };
  };

  const bmiCat = getBmiCategory(currentBmi);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-secondary text-white px-5 py-3 rounded-xl shadow-lg border border-white/10 animate-bounce">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Dashboard Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Track metrics, logs, and progress predictions</p>
        </div>
      </div>

      {/* Onboarding Profile Warning Banner */}
      {isMockProfile && (
        <div className="p-4 bg-primary/10 border border-white/5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/20 rounded-xl text-primary">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Action Required: Setup Your Profile Settings</h4>
              <p className="text-xs text-slate-400">You are currently viewing placeholder data. Configure your weight, height, and fitness goals to activate personalized calculations.</p>
            </div>
          </div>
          <Link
            to="/profile"
            className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shrink-0"
          >
            Configure Profile
          </Link>
        </div>
      )}

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Current Weight</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{currentWeight} kg</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-secondary" /> -4.0 kg overall
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Current BMI</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{currentBmi}</h3>
            <p className={`text-xs ${bmiCat.color} font-semibold flex items-center gap-1 mt-1`}>
              {bmiCat.label}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Calorie Budget</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{diet?.calories || 0} kcal</h3>
            <p className="text-xs text-slate-500 mt-1">P: {diet?.protein}g | C: {diet?.carbs}g | F: {diet?.fat}g</p>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent-purple/10 border border-accent-purple/20 text-accent-purple">
            <Dumbbell className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Workout Split</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{workout?.split.split(' ')[0]}</h3>
            <p className="text-xs text-slate-500 mt-1">{workout?.exercises.length} Exercises total</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weight Progress Chart */}
        <div className="glass-panel p-5 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" /> Weight Progress History
            </h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" domain={['dataMin - 2', 'dataMax + 2']} fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#12121e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="Weight" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Log Weight Form */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Scale className="h-5 w-5 text-secondary" /> Log Daily Metrics
          </h3>
          <p className="text-xs text-slate-400">Keep regular weight logs to adjust daily caloric budgets.</p>
          <form onSubmit={handleLogProgress} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="e.g. 78.5"
                value={logWeight}
                onChange={(e) => setLogWeight(e.target.value)}
                className="w-full bg-slate-900/40 border border-white/5 rounded-xl py-2.5 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-secondary transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Height (cm)</label>
              <input
                type="number"
                required
                placeholder="e.g. 178"
                value={logHeight}
                onChange={(e) => setLogHeight(e.target.value)}
                className="w-full bg-slate-900/40 border border-white/5 rounded-xl py-2.5 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-secondary transition-all text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-secondary hover:bg-secondary-hover text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-sm shadow-md shadow-secondary/15"
            >
              <Plus className="h-4 w-4" /> Save Log
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diet breakdown */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Flame className="h-5 w-5 text-accent-cyan" /> Nutrition Macro Split (Calories)
          </h3>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-44 w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={macroData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={60} tickLine={false} />
                  <Bar dataKey="calories" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {macroData.map((m) => (
                <div key={m.name} className="flex justify-between items-center p-2 rounded-xl bg-white/5 border border-white/5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: m.fill }} />
                    <span className="font-semibold text-slate-300">{m.name}</span>
                  </div>
                  <span className="text-white font-bold">{m.grams}g <span className="text-xs text-slate-500">({m.calories} kcal)</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Workout list */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-accent-purple" /> Active Workout Routine
          </h3>
          <p className="text-xs text-slate-400">Targeting: <span className="text-white font-semibold">{workout?.split}</span></p>
          <div className="space-y-2 max-h-[160px] overflow-y-auto">
            {workout?.exercises.map((ex: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                <span className="font-semibold text-slate-200">{ex.name}</span>
                <span className="text-accent-purple font-bold">{ex.sets} Sets x {ex.reps} Reps</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
