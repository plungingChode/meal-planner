import { Timestamp } from '@firebase/firestore';
import type { 
  Food, 
  FoodCategory, 
  Meal, 
  MealBlueprint, 
  NutrientLimits 
} from '../models';

const categories: FoodCategory[] = [
  { id: "A", name: "A" }, 
  { id: "B", name: "B" }
];

const food: Food[] = [
  {
    name: "A",
    category: "A",
    refAmount: 1,
    refUnit: "g",
    portionMultiplier: 1.0,
    energy: 1,
    carbohydrates: 1,
    protein: 1,
    fat: 1,
    comment: "-"
  },
  {
    name: "B",
    category: "B",
    refAmount: 2,
    refUnit: "g",
    portionMultiplier: 0.5,
    energy: 2,
    carbohydrates: 2,
    protein: 2,
    fat: 2,
    comment: "-"
  }
];

const limits: NutrientLimits = {
  energy: { max: 1 },
  carbohydrates: { min: 1, max: 2 },
  protein: { min: 99, max: Number.POSITIVE_INFINITY },
  fat: { max: 0 },
}

const meal: Meal = {
  id: 'meal-1',
  name: 'Meal 1',
  portions: [
    { food: food[0], qty: 1 },
    { food: food[1], qty: 1 },
  ],
  limits: limits,
  date: Timestamp.fromDate(new Date(2001, 0, 13)),
  order: 1,
}

export {
  categories,
  food,
  limits,
  meal,
}