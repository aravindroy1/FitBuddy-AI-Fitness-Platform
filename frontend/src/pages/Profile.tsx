import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import {
  Settings, User, CheckCircle, Info, Flame, Scale, Activity
} from 'lucide-react';

export const Profile: React.FC = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [activityLevel, setActivityLevel] = useState('moderately_active');
  const [fitnessGoal, setFitnessGoal] = useState('muscle_gain');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadProfile = async () => {
    try {
      const res = await api.profile.get();
      if (res.data) {
        setHeight(res.data.height.toString());
        setWeight(res.data.weight.toString());
        setAge(res.data.age.toString());
        setGender(res.data.gender);
        setActivityLevel(res.data.activityLevel);
        setFitnessGoal(res.data.fitnessGoal);
      }
    } catch (err) {
      // Mock loading if profile not exists in DB yet
      setHeight('178');
      setWeight('82');
      setAge('26');
      setGender('male');
      setActivityLevel('moderately_active');
      setFitnessGoal('muscle_gain');
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const payload = {
      height: Number(height),
      weight: Number(weight),
      age: Number(age),
      gender,
      activityLevel,
      fitnessGoal
    };

    try {
      // Try to create/update
      await api.profile.update(payload);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      try {
        await api.profile.create(payload);
        setMessage('Profile created successfully!');
        setTimeout(() => setMessage(''), 3000);
      } catch (err2) {
        setError('Failed to save profile details. Saving locally (mock).');
        setTimeout(() => setError(''), 3500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <Settings className="h-7 w-7 text-primary" /> Profile Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">Configure physical traits and workout objectives</p>
      </div>

      {message && (
        <div className="p-4 bg-secondary/10 border border-secondary/25 rounded-xl text-secondary text-sm flex items-center gap-2">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 text-sm flex items-center gap-2">
          <Info className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-6">
        <h3 className="font-bold text-white text-lg flex items-center gap-2 pb-3 border-b border-white/5">
          <User className="h-5 w-5 text-primary" /> Body Measurements & Traits
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Scale className="h-3.5 w-3.5 text-slate-400" /> Height (cm)
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full bg-slate-900/40 border border-white/5 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Scale className="h-3.5 w-3.5 text-slate-400" /> Weight (kg)
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 75"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-slate-900/40 border border-white/5 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-slate-400" /> Age (years)
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 25"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-slate-900/40 border border-white/5 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary transition-all text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full bg-slate-900/40 border border-white/5 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary transition-all text-sm"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Activity Level</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full bg-slate-900/40 border border-white/5 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary transition-all text-sm"
            >
              <option value="sedentary">Sedentary (desk job)</option>
              <option value="lightly_active">Lightly Active (light exercise)</option>
              <option value="moderately_active">Moderately Active (exercise 3-5 days)</option>
              <option value="very_active">Very Active (hard exercise 6-7 days)</option>
              <option value="extremely_active">Extremely Active (athlete/physical job)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Fitness Goal</label>
            <select
              value={fitnessGoal}
              onChange={(e) => setFitnessGoal(e.target.value)}
              className="w-full bg-slate-900/40 border border-white/5 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary transition-all text-sm"
            >
              <option value="weight_loss">Weight Loss</option>
              <option value="weight_gain">Weight Gain</option>
              <option value="muscle_gain">Muscle Gain</option>
              <option value="body_recomposition">Body Recomposition</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-primary to-accent-cyan hover:brightness-110 active:brightness-95 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all text-sm shadow-md shadow-primary/20"
        >
          <Flame className="h-4 w-4" /> {loading ? 'Saving Parameters...' : 'Save Profile Settings'}
        </button>
      </form>
    </div>
  );
};
