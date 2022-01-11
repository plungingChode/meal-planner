import type { Food, Meal, MealBlueprint, NutrientLimits } from '../models';

import { food, limits, meal } from './mockData'

// CRUD
// Food list
async function getFoodList(userID: string) {
  return food;
}

// Blueprints
async function addMealBlueprint(
  userID: string,
  projectID: string,
  blueprint: MealBlueprint
) {
  return { ...blueprint, id: 'xxx' }
}

async function getMealBlueprints(userID: string, projectID: string) {
  return [/* TODO */];
}

// Meals
async function getMeals(
  userID: string,
  projectID: string,
  beginDate: Date,
  endDate?: Date
) {
  return [meal];
}

async function addMeal(userID: string, projectID: string, meal: Meal) {
  return { ...meal, id: 'xxx' }
}

async function updateMeal(userID: string, projectID: string, meal: Meal) {
}

export {
  getFoodList,
  getMeals,
  addMeal,
  updateMeal,
  getMealBlueprints,
  addMealBlueprint,
}

export default {
  getFoodList,
  getMeals,
  addMeal,
  updateMeal,
  getMealBlueprints,
  addMealBlueprint,
};