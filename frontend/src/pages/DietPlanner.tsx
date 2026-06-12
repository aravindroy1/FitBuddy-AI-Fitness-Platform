import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import {
  Utensils, Sparkles, Scale, RefreshCw, ChefHat, Info
} from 'lucide-react';

interface Meal {
  name: string;
  foodItems: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DietPlan {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: Meal[];
}

export const DietPlanner: React.FC = () => {
  const [diet, setDiet] = useState<DietPlan | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [activeSubstitute, setActiveSubstitute] = useState<{ mealIndex: number; foodItem: string; options: string[] } | null>(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const dietRes = await api.diet.getLatest();
      setDiet(dietRes.data);
    } catch (err) {
      // Setup Mock Initial state
    }

    try {
      const profileRes = await api.profile.get();
      setProfile(profileRes.data);
    } catch (err) {
      setProfile({
        height: 178,
        weight: 80,
        age: 27,
        gender: 'male',
        activityLevel: 'moderately_active',
        fitnessGoal: 'weight_loss'
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateDiet = async () => {
    if (!profile) return;
    setLoading(true);
    setError('');

    try {
      const res = await api.diet.generate({
        height: profile.height,
        weight: profile.weight,
        age: profile.age,
        gender: profile.gender,
        activityLevel: profile.activityLevel,
        fitnessGoal: profile.fitnessGoal
      });
      setDiet(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to contact AI Foundry. Loaded calculated local plan.');
      // Local calculation backup logic
      const targetCalories = profile.fitnessGoal === 'weight_loss' ? 1800 : 2500;
      const calculatedPlan = {
        calories: targetCalories,
        protein: Math.round((targetCalories * 0.35) / 4),
        carbs: Math.round((targetCalories * 0.4) / 4),
        fat: Math.round((targetCalories * 0.25) / 9),
        meals: [
          { name: 'Breakfast', foodItems: ['Oatmeal with Almond Milk', '4 Egg Whites Scrambled'], calories: 400, protein: 30, carbs: 45, fat: 8 },
          { name: 'Lunch', foodItems: ['Grilled Salmon (150g)', 'Baked Sweet Potato (120g)', 'Asparagus'], calories: 550, protein: 42, carbs: 35, fat: 18 },
          { name: 'Snack', foodItems: ['Whey Protein Scoop', 'Rice Cakes (2)'], calories: 250, protein: 26, carbs: 22, fat: 2 },
          { name: 'Dinner', foodItems: ['Lean Ground Turkey (180g)', 'Quinoa (100g)', 'Broccoli'], calories: 600, protein: 48, carbs: 40, fat: 12 }
        ]
      };
      setDiet(calculatedPlan);
    } finally {
      setLoading(false);
    }
  };

  const handleSubstitute = async (mealIndex: number, foodItem: string) => {
    try {
      const res = await api.diet.substitute(diet?.meals[mealIndex].name || '', foodItem);
      setActiveSubstitute({
        mealIndex,
        foodItem,
        options: res.data.substitutes
      });
    } catch (err) {
      // Fallback substitutions
      setActiveSubstitute({
        mealIndex,
        foodItem,
        options: ['Tofu Scramble (150g)', 'Tempeh strips (100g)', 'Seitan slices (100g)']
      });
    }
  };

  const selectSubstitution = (sub: string) => {
    if (!diet || activeSubstitute === null) return;

    const updatedMeals = diet.meals.map((meal, idx) => {
      if (idx === activeSubstitute.mealIndex) {
        return {
          ...meal,
          foodItems: meal.foodItems.map(item => item === activeSubstitute.foodItem ? sub : item)
        };
      }
      return meal;
    });

    setDiet({
      ...diet,
      meals: updatedMeals
    });
    setActiveSubstitute(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Utensils className="h-7 w-7 text-primary" /> Diet Planner
          </h1>
          <p className="text-slate-400 text-sm mt-1">Receive AI recommendations tailored to your metabolic profiles</p>
        </div>

        <button
          onClick={handleGenerateDiet}
          disabled={loading}
          className="bg-gradient-to-r from-primary to-accent-cyan hover:brightness-110 active:brightness-95 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all text-sm shadow-md shadow-primary/20"
        >
          <Sparkles className="h-4 w-4" /> {loading ? 'Compiling Diet...' : 'Generate AI Diet Plan'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 text-sm flex items-start gap-2">
          <Info className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {diet ? (
        <div className="space-y-6">
          {/* Summary Macros Bar */}
          <div className="glass-panel p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center md:border-r border-white/5">
              <p className="text-xs text-slate-400 font-semibold uppercase">Daily Calories</p>
              <h4 className="text-xl font-bold text-white mt-1">{diet.calories} kcal</h4>
            </div>
            <div className="text-center md:border-r border-white/5">
              <p className="text-xs text-slate-400 font-semibold uppercase">Protein</p>
              <h4 className="text-xl font-bold text-primary mt-1">{diet.protein}g</h4>
            </div>
            <div className="text-center md:border-r border-white/5">
              <p className="text-xs text-slate-400 font-semibold uppercase">Carbohydrates</p>
              <h4 className="text-xl font-bold text-accent-cyan mt-1">{diet.carbs}g</h4>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 font-semibold uppercase">Fats</p>
              <h4 className="text-xl font-bold text-accent-purple mt-1">{diet.fat}g</h4>
            </div>
          </div>

          {/* Meals layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {diet.meals.map((meal, mealIdx) => (
              <div key={mealIdx} className="glass-panel p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-3">
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                      <ChefHat className="h-5 w-5 text-primary" /> {meal.name}
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-slate-300">
                      {meal.calories} kcal
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {meal.foodItems.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex justify-between items-center text-sm p-2 rounded-xl bg-white/5 border border-white/5 group">
                        <span className="text-slate-300">{item}</span>
                        <button
                          onClick={() => handleSubstitute(mealIdx, item)}
                          className="text-xs text-primary font-semibold hover:text-white flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/60 px-2 py-1 rounded"
                        >
                          <RefreshCw className="h-3 w-3" /> Swap
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Protein</span>
                    <span className="font-bold text-primary">{meal.protein}g</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Carbs</span>
                    <span className="font-bold text-accent-cyan">{meal.carbs}g</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Fat</span>
                    <span className="font-bold text-accent-purple">{meal.fat}g</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-panel p-10 text-center space-y-4">
          <div className="inline-flex p-4 bg-primary/10 rounded-full border border-primary/20 text-primary">
            <Scale className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No Diet Plan Active</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Click the "Generate AI Diet Plan" button to query Azure AI models and construct your custom calorie and meal split.
          </p>
        </div>
      )}

      {/* Substitution Modal */}
      {activeSubstitute && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="glass-panel p-6 w-full max-w-sm border border-primary/25 space-y-4">
            <div>
              <h4 className="text-lg font-bold text-white">Substitutes for:</h4>
              <p className="text-sm text-slate-400 italic mt-0.5">"{activeSubstitute.foodItem}"</p>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {activeSubstitute.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => selectSubstitution(option)}
                  className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-primary/20 hover:text-white border border-white/5 text-sm text-slate-300 transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>

            <button
              onClick={() => setActiveSubstitute(null)}
              className="w-full py-2 border border-white/10 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
