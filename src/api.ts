import type { FoodRecord } from './models';

import { categories, foodRecords, meals } from './sampleData';

async function getFoodList(authToken: string): Promise<FoodRecord[]> {
  return foodRecords;
}

async function getCategoryMap(authToken: string) {
  return categories;
}

async function getMeals(authToken: string, date: Date) {
  return meals;
}

export {
  getFoodList,
  getCategoryMap,
  getMeals
}