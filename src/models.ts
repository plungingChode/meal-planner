interface FoodRecord {
  name: string;
  category: number;

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
  food: FoodRecord;
  qty: number;
}

interface Interval { 
  min: number, 
  max: number 
}

/**
 * Constrain nutrients within a given interval or set an upper boundary
 */
interface NutrientLimits {
  energy: number | Interval;
  carbohydrates: number | Interval;
  protein: number | Interval;
  fat: number | Interval;
}

interface Meal {
  id: string;
  name: string;
  portions: FoodPortion[];
  limits: NutrientLimits;
}

export type {
  FoodRecord,
  FoodNutrients,
  FoodPortion,
  Interval,
  NutrientLimits,
  Meal
}