import type {
  Food,
  FoodCategory,
  Meal,
  MealBlueprint,
  NutrientLimits,
  ProjectDefinition,
  SessionInfo
} from '../models';

import { food, limits, meal, categories, projects } from './mock-data';
import { Timestamp } from '@firebase/firestore';

// CRUD
// Saved session info
async function saveSession(userID: string, session: SessionInfo) {
}

async function getSession(userID: string): Promise<SessionInfo> {
  return {
    currentProject: 'xxx',
    displayDate: Timestamp.now(),
  };
}

// Project
async function getProjects(userID: string) {
  return projects;
}

interface ProjectInit {
  project: ProjectDefinition;
  blueprints: MealBlueprint[];
}

async function addProject(userID: string, args: ProjectInit): Promise<ProjectInit> {
  // Return original args, updated with document ID
  return {
    project: { ...args.project, id: args.project.name },
    blueprints: args.blueprints.map((bp, idx) => ({ ...bp, id: bp.name + idx })),
  };
}

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
  return { ...blueprint, id: 'xxx' };
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
  return { ...meal, id: 'xxx' };
}

async function updateMeal(userID: string, projectID: string, meal: Meal) {
}

export {
  saveSession,
  getSession,
  getProjects,
  addProject,
  getFoodCategories,
  addFoodCategory,
  getFoodList,
  updateFood,
  getMeals,
  addMeal,
  updateMeal,
  getMealBlueprints,
  addMealBlueprint,
};

const API = {
  saveSession,
  getSession,
  getProjects,
  getFoodCategories,
  addFoodCategory,
  getFoodList,
  updateFood,
  getMeals,
  addMeal,
  updateMeal,
  getMealBlueprints,
  addMealBlueprint,
};

export default API;
