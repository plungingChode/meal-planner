import type { Food, FoodCategory, Meal, MealBlueprint, NutrientLimits } from '../models';

import { food, limits, meal, categories } from './mockData'

// CRUD
// Food category
async function getFoodCategories(userID: string) {
  return categories;
}

async function addFoodCategory(userID: string, category: FoodCategory) {
  return category;
}

// Food list
async function getFoodList(userID: string) {
  return food;
}

async function updateFood(userID: string, food: Food) {
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
  getFoodCategories,
  addFoodCategory,
  getFoodList,
  getMeals,
  addMeal,
  updateMeal,
  getMealBlueprints,
  addMealBlueprint,
}

export default {
  getFoodCategories,
  addFoodCategory,
  getFoodList,
  getMeals,
  addMeal,
  updateMeal,
  getMealBlueprints,
  addMealBlueprint,
};