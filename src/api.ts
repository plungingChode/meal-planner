import type { FoodRecord, Meal, MealBlueprint } from './models';
import type { FirestoreDataConverter } from '@firebase/firestore'

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
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
  .catch(reason => {})

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
const foodRecordConverter = createPlainConverter<FoodRecord>();
const mealBlueprintConverter = createPlainConverter<MealBlueprint>();
const mealConverter = createPlainConverter<Meal>();

// Collection references
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
// Food list
async function getFoodList(userID: string) {
  const snapshot = await getDocs(foodCollection(userID));
  const foodList = snapshot.docs.map(doc => doc.data());

  return foodList;
}

// Blueprints
async function addMealBlueprint(
  userID: string,
  projectID: string,
  blueprint: MealBlueprint
) {
  const blueprintCollection =
    collection(db, 'mealPlanner', userID, 'projects', projectID, 'blueprints')
      .withConverter(mealBlueprintConverter);

  const result = await addDoc(blueprintCollection, blueprint);
  return { ...blueprint, id: result.id }
}

async function getMealBlueprints(userID: string, projectID: string) {
  const snapshot = await getDocs(blueprintCollection(userID, projectID));
  const blueprints = snapshot.docs.map(doc => doc.data());

  return blueprints;
}

// Meals
async function getMeals(
  userID: string,
  projectID: string,
  beginDate: Date,
  endDate?: Date
) {
  const snapshot = await getDocs(query(
    mealCollection(userID, projectID),
    where('date', '>=', beginDate),
    where('date', '<=', endDate ?? beginDate)
  ));
  const meals = snapshot.docs.map(doc => doc.data());

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