import type { FoodRecord, Meal, MealBlueprint, NutrientLimits } from '../models';

const food: FoodRecord[] = [
  {
    name: "A",
    category: 1,
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
    category: 2,
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
  energy: 1,
  carbohydrates: { min: 1, max: 2 },
  protein: { min: 99, max: Number.POSITIVE_INFINITY },
  fat: 0,
}

const meal: Meal = {
  id: 'meal-1',
  name: 'Meal 1',
  portions: [
    { food: food[0], qty: 1 },
    { food: food[1], qty: 1 },
  ],
  limits: limits,
  date: new Date(2001, 0, 13),
  order: 1,
}

export {
  food,
  limits,
  meal,
}