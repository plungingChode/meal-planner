import type { Timestamp } from "@firebase/firestore"

interface SessionInfo {
  id?: string;
  currentProject: string;
  displayDate: Timestamp;
}

interface ProjectDefinition {
  id?: string;
  name: string;
}

interface FoodCategory {
  id: string;
  name: string;
}

interface Food {
  id?: string;
  name: string;
  category: string;

  refAmount: number;
  refUnit: string;
  portionMultiplier: number;

  energy: number;
  carbohydrates: number;
  protein: number;
  fat: number;

  comment?: string;
}

type FoodNutrients = 'energy' | 'carbohydrates' | 'protein' | 'fat'

interface FoodPortion {
  food: Food;
  qty: number;
}

interface Interval { 
  min?: number;
  max?: number;
}

/**
 * Constrain nutrients within a given interval
 */
interface NutrientLimits {
  energy: Interval;
  carbohydrates: Interval;
  protein: Interval;
  fat: Interval;
}

interface Meal {
  id: string;
  name: string;
  portions: FoodPortion[];
  limits: NutrientLimits;
  date: Timestamp;
  order: number;
}

interface MealBlueprint {
  id?: string;
  name: string;
  limits: NutrientLimits;
  order: number;
}

interface MealPlan {
  id?: string;
  mealBlueprints: MealBlueprint[];
}

export type {
  SessionInfo,
  ProjectDefinition,
  FoodCategory,
  Food,
  FoodNutrients,
  FoodPortion,
  Interval,
  NutrientLimits,
  Meal,
  MealBlueprint,
  MealPlan
}