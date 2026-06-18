import { DietRepository } from '../repositories/DietRepository.js';
import { IDiet, IMeal } from '../models/Diet.js';
import { AzureOpenAI } from 'openai';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

export class DietService {
  private dietRepository = new DietRepository();

  async getLatestDiet(userId: string): Promise<IDiet | null> {
    return this.dietRepository.findByUserId(userId);
  }

  async generateDietPlan(
    userId: string,
    profile: {
      height: number;
      weight: number;
      age: number;
      gender: 'male' | 'female' | 'other';
      activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
      fitnessGoal: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'body_recomposition';
    }
  ): Promise<IDiet> {
    logger.info(`Generating diet plan for user: ${userId}`);

    // Calorie Calculation (Mifflin-St Jeor)
    const genderOffset = profile.gender === 'male' ? 5 : profile.gender === 'female' ? -161 : -78;
    const bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + genderOffset;

    let activityMultiplier = 1.2;
    switch (profile.activityLevel) {
      case 'lightly_active': activityMultiplier = 1.375; break;
      case 'moderately_active': activityMultiplier = 1.55; break;
      case 'very_active': activityMultiplier = 1.725; break;
      case 'extremely_active': activityMultiplier = 1.9; break;
    }

    const tdee = Math.round(bmr * activityMultiplier);
    let targetCalories = tdee;

    let proteinRatio = 0.3;
    let carbsRatio = 0.45;
    let fatRatio = 0.25;

    switch (profile.fitnessGoal) {
      case 'weight_loss':
        targetCalories = tdee - 500;
        proteinRatio = 0.4;
        carbsRatio = 0.35;
        fatRatio = 0.25;
        break;
      case 'weight_gain':
        targetCalories = tdee + 500;
        proteinRatio = 0.25;
        carbsRatio = 0.55;
        fatRatio = 0.20;
        break;
      case 'muscle_gain':
        targetCalories = tdee + 300;
        proteinRatio = 0.35;
        carbsRatio = 0.45;
        fatRatio = 0.20;
        break;
      case 'body_recomposition':
        targetCalories = tdee;
        proteinRatio = 0.35;
        carbsRatio = 0.4;
        fatRatio = 0.25;
        break;
    }

    const targetProtein = Math.round((targetCalories * proteinRatio) / 4);
    const targetCarbs = Math.round((targetCalories * carbsRatio) / 4);
    const targetFat = Math.round((targetCalories * fatRatio) / 9);

    // Call Azure AI Foundry (Mock/Fallback implementation)
    let meals: IMeal[] = [];
    if (process.env.AZURE_AI_FOUNDRY_ENDPOINT && process.env.AZURE_OPENAI_API_KEY) {
      logger.info('Calling Azure AI Foundry to generate structured diet plan...');
      try {
        const client = new AzureOpenAI({
          endpoint: process.env.AZURE_AI_FOUNDRY_ENDPOINT,
          apiKey: process.env.AZURE_OPENAI_API_KEY,
          apiVersion: "2024-05-01-preview"
        });
        const prompt = `Generate a daily diet plan with ${targetCalories} calories, ${targetProtein}g protein, ${targetCarbs}g carbs, and ${targetFat}g fat. Return ONLY a valid JSON array where each object has 'mealName' (e.g. Breakfast), 'items' (array of strings), and 'calories' (number).`;
        const result = await client.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }]
        });
        const content = result.choices[0].message?.content || '[]';
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
        meals = JSON.parse(jsonStr);
      } catch (err: any) {
        logger.error(`Error calling Azure OpenAI: ${err.message}`);
        meals = this.generateFallbackMeals(targetCalories, targetProtein, targetCarbs, targetFat, profile.fitnessGoal);
      }
    } else {
      // Default High-Fidelity Meal Generator Fallback
      meals = this.generateFallbackMeals(targetCalories, targetProtein, targetCarbs, targetFat, profile.fitnessGoal);
    }

    return this.dietRepository.create({
      userId,
      calories: targetCalories,
      protein: targetProtein,
      carbs: targetCarbs,
      fat: targetFat,
      meals
    });
  }

  private generateFallbackMeals(
    calories: number,
    protein: number,
    carbs: number,
    fat: number,
    goal: string
  ): IMeal[] {
    const isWeightLoss = goal === 'weight_loss';

    return [
      {
        name: 'Breakfast',
        foodItems: isWeightLoss
          ? ['3 Egg White Omelet with Spinach', '1 Slice Whole Wheat Toast', 'Black Coffee']
          : ['3 Whole Eggs Omelet with Avocado', '2 Slices Sourdough Toast', 'Greek Yogurt with Honey'],
        calories: Math.round(calories * 0.25),
        protein: Math.round(protein * 0.3),
        carbs: Math.round(carbs * 0.2),
        fat: Math.round(fat * 0.25)
      },
      {
        name: 'Lunch',
        foodItems: isWeightLoss
          ? ['Grilled Chicken Breast (150g)', 'Steamed Broccoli', 'Quinoa (100g)']
          : ['Pan-Seared Salmon (200g)', 'Brown Rice (200g)', 'Roasted Asparagus in Olive Oil'],
        calories: Math.round(calories * 0.35),
        protein: Math.round(protein * 0.35),
        carbs: Math.round(carbs * 0.35),
        fat: Math.round(fat * 0.35)
      },
      {
        name: 'Snack',
        foodItems: isWeightLoss
          ? ['1 Apple', '15 Raw Almonds']
          : ['Whey Protein Shake', '1 Banana', 'Peanut Butter (2 tbsp)'],
        calories: Math.round(calories * 0.15),
        protein: Math.round(protein * 0.1),
        carbs: Math.round(carbs * 0.2),
        fat: Math.round(fat * 0.15)
      },
      {
        name: 'Dinner',
        foodItems: isWeightLoss
          ? ['Baked Cod Fillet (180g)', 'Mixed Green Salad with Lemon Dressing', 'Sweet Potato (100g)']
          : ['Lean Ground Beef (200g) Stir-fry', 'Jasmine Rice (200g)', 'Zucchini and Carrots'],
        calories: Math.round(calories * 0.25),
        protein: Math.round(protein * 0.25),
        carbs: Math.round(carbs * 0.25),
        fat: Math.round(fat * 0.25)
      }
    ];
  }

  async getMealSubstitution(mealName: string, currentItem: string): Promise<string[]> {
    logger.info(`Getting substitutions for ${currentItem} in ${mealName}`);
    
    // Azure AI Foundry Integration
    if (process.env.AZURE_AI_FOUNDRY_ENDPOINT && process.env.AZURE_OPENAI_API_KEY) {
      logger.info('Calling Azure AI Foundry for meal substitutions...');
      try {
        const client = new AzureOpenAI({
          endpoint: process.env.AZURE_AI_FOUNDRY_ENDPOINT,
          apiKey: process.env.AZURE_OPENAI_API_KEY,
          apiVersion: "2024-05-01-preview"
        });
        const prompt = `Give me 3 healthy substitutions for "${currentItem}" in a "${mealName}". Return ONLY a valid JSON array of strings.`;
        const result = await client.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }]
        });
        const content = result.choices[0].message?.content || '[]';
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
      } catch (err: any) {
        logger.error(`Error calling Azure OpenAI: ${err.message}`);
      }
    }

    const substitutionsMap: Record<string, string[]> = {
      'chicken breast': ['Turkey breast (100g)', 'Tofu (150g)', 'Seitan (100g)', 'Shrimp (120g)'],
      'salmon': ['Tuna steak (150g)', 'Mackerel (120g)', 'Cod fillet (180g)', 'Tempeh (150g)'],
      'whole eggs': ['Egg whites (6)', 'Tofu scramble (200g)', 'Tempeh (100g)'],
      'sourdough toast': ['Gluten-free toast', 'Oatcakes (3)', 'Sweet potato slices (100g)'],
      'quinoa': ['Brown rice (100g)', 'Bulgur wheat (100g)', 'Cauliflower rice (300g)'],
      'greek yogurt': ['Coconut yogurt', 'Cottage cheese (150g)', 'Skyr'],
      'peanut butter': ['Almond butter (2 tbsp)', 'Sunflower seed butter (2 tbsp)', 'Avocado (50g)'],
      'whey protein': ['Pea protein powder', 'Soy protein powder', 'Hemp protein powder']
    };

    const key = currentItem.toLowerCase();
    for (const [food, subs] of Object.entries(substitutionsMap)) {
      if (key.includes(food) || food.includes(key)) {
        return subs;
      }
    }

    return ['Mixed Greens', 'Steamed Vegetables', 'Lentils (100g)', 'Egg Whites (4)'];
  }
}
