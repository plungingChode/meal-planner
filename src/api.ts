import type { Food, FoodCategory, Meal, MealBlueprint, SessionInfo, ProjectDefinition } from './models';
import type { FirestoreDataConverter, Timestamp } from '@firebase/firestore';

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  enableIndexedDbPersistence,
  query,
  where,
  doc,
} from '@firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBt2XDrKqpIvTvXSQyoX3rac1HIRab0vD8',
  authDomain: 'plungingchode-test.firebaseapp.com',
  databaseURL: 'https://plungingchode-test-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'plungingchode-test',
  storageBucket: 'plungingchode-test.appspot.com',
  messagingSenderId: '239378787887',
  appId: '1:239378787887:web:b30f4b7bf448954bc5a0da',
  // measurementId: 'G-SP4BRTY39K'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// TODO handle errors
enableIndexedDbPersistence(db)
  .catch(reason => { })

/**
 * Create a converter that transforms Firestore documents into models by
 * merging their document ID into them when querying, and removing it when
 * uploading.
 * 
 * @returns A new Firebase data converter
 */
function createPlainConverter<T extends { id?: string }>(): FirestoreDataConverter<T> {
  return {
    toFirestore: (doc: T) => {
      delete doc.id;
      return doc;
    },
    fromFirestore: (snapshot, options) => {
      return { ...snapshot.data(options), id: snapshot.id } as T
    },
  }
}

// Converters
const sessionConverter = createPlainConverter<SessionInfo>();
const projectConverter = createPlainConverter<ProjectDefinition>();
const categoryConverter = createPlainConverter<FoodCategory>();
const foodRecordConverter = createPlainConverter<Food>();
const mealBlueprintConverter = createPlainConverter<MealBlueprint>();
const mealConverter = createPlainConverter<Meal>();

// Collection references
function sessionDocument(userID: string) {
  return doc(db, 'mealPlanner', userID)
    .withConverter(sessionConverter);
}
function projectCollection(userID: string) {
  return collection(db, 'mealPlanner', userID, 'projects')
    .withConverter(projectConverter);
}
function categoryCollection(userID: string) {
  return collection(db, 'mealPlanner', userID, 'foodCategories')
    .withConverter(categoryConverter);
}
function foodCollection(userID: string) {
  return collection(db, 'mealPlanner', userID, 'foodList')
    .withConverter(foodRecordConverter);
}
function mealCollection(userID: string, projectID: string) {
  return collection(db, 'mealPlanner', userID, 'projects', projectID, 'meals')
    .withConverter(mealConverter);
}
function blueprintCollection(userID: string, projectID: string) {
  return collection(db, 'mealPlanner', userID, 'projects', projectID, 'blueprints')
    .withConverter(mealBlueprintConverter);
}

// CRUD
// Saved session info
async function saveSession(userID: string, session: SessionInfo) {
  await updateDoc(sessionDocument(userID), session);
}

async function getSession(userID: string) {
  return (await getDoc(sessionDocument(userID))).data();
}

// Project
async function getProjects(userID: string) {
  const projectDocs = await getDocs(projectCollection(userID));
  const projects = projectDocs.docs.map(doc => doc.data());
  return projects;
}

interface ProjectInit {
  project: ProjectDefinition;
  blueprints: MealBlueprint[];
}

async function addProject(userID: string, args: ProjectInit): Promise<ProjectInit> {
  const projects = projectCollection(userID);

  // Create project entry
  const newProject = await addDoc(projects, { name: args.project.name });
  const projectWithID = { ...args.project, id: newProject.id }

  // Add blueprints
  const blueprintRequests = args.blueprints
    .map(bp => addDoc(collection(newProject, 'blueprints'), bp))
  const blueprintsWithID = (await Promise.all(blueprintRequests))
    .map((doc, idx) => ({ ...args.blueprints[idx], id: doc.id }));

  // Return original args, updated with document ID
  return {
    project: projectWithID,
    blueprints: blueprintsWithID,
  }
}

// Food category
async function getFoodCategories(userID: string) {
  const snapshot = await getDocs(categoryCollection(userID));
  const categories = snapshot.docs.map(doc => doc.data());

  return categories;
}

async function addFoodCategory(userID: string, category: FoodCategory) {
  await setDoc(doc(categoryCollection(userID), category.id), category);
  return category;
}

// Food list
async function getFoodList(userID: string) {
  const snapshot = await getDocs(foodCollection(userID));
  const foodList = snapshot.docs.map(doc => doc.data());

  return foodList;
}

async function updateFood(userID: string, food: Food) {
  const foodRef = doc(foodCollection(userID), food.id);
  await updateDoc(foodRef, food);
}

// Blueprints
async function addMealBlueprint(
  userID: string,
  projectID: string,
  blueprint: MealBlueprint
) {
  const result = await addDoc(blueprintCollection(userID, projectID), blueprint);
  return { ...blueprint, id: result.id }
}

async function getMealBlueprints(userID: string, projectID: string) {
  const snapshot = await getDocs(blueprintCollection(userID, projectID));
  const blueprints = snapshot.docs.map(doc => doc.data()).sort((a, b) => a.order - b.order);

  return blueprints;
}

// Meals
async function getMeals(
  userID: string,
  projectID: string,
  beginDate: Timestamp,
  endDate?: Timestamp
) {
  const snapshot = await getDocs(query(
    mealCollection(userID, projectID),
    where('date', '>=', beginDate),
    where('date', '<=', endDate ?? beginDate)
  ));
  const meals = snapshot.docs.map(doc => doc.data());
  meals.sort((a, b) => {
    const nsA = (+a.date);
    const nsB = (+b.date);

    return nsA === nsB
      ? a.order - b.order
      : nsA - nsB;
  });

  return meals;
}

async function addMeal(userID: string, projectID: string, meal: Meal) {
  const result = await addDoc(mealCollection(userID, projectID), meal);
  return { ...result, id: result.id }
}

async function updateMeal(userID: string, projectID: string, meal: Meal) {
  const mealRef = doc(mealCollection(userID, projectID), meal.id);

  await updateDoc(mealRef, meal);
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
}

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
}

export default API;
