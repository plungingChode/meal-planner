import type { FoodPortion, Food, Meal, MealBlueprint, FoodCategory, FoodNutrients } from './models';

import React, { useEffect, useReducer, useRef, useState } from 'react';
import { Timestamp } from '@firebase/firestore';
import { pureInsert, pureDelete } from './pureutil';
import API from './api';

import FoodList from './FoodList';
import Menubar from './EditorMenu';
import MealDisplay from './MealDisplay';

import './App.scss';

type AppState = {
  selectedMeal: string;
  meals: Meal[];
  blueprints: MealBlueprint[];
  displayDate: Timestamp;
  currentProject: string;
};

type AppAction =
  | { type: 'initialize', payload: AppState }
  | { type: 'setSelectedMeal', payload: string }
  | { type: 'setMeals', payload: Meal[] }
  | { type: 'setBlueprints', payload: MealBlueprint[] }
  | { type: 'addPortion', payload: Food }
  | { type: 'removePortion', food: FoodPortion, mealID: string }
  | { type: 'changeDisplayDate', newDate: Timestamp, meals: Meal[] }

/**
 * Add a portion of `food` to the currently selected meal.
 * 
 * @param state The current state.
 * @param food The food to add.
 * @returns A new state with a portion of `food` added.
 */
function addPortion(state: AppState, food: Food): AppState {
  if (!state.selectedMeal) {
    throw new Error('No meal selected');
  }

  const portion = {
    food: food,
    qty: 1
  }

  const mealIdx = state.meals.findIndex(m => m.id === state.selectedMeal);
  const oldMeal = state.meals[mealIdx];

  const oldPortions = oldMeal.portions;
  const portionIdx = oldPortions.findIndex(p => p.food.id === food.id);
  if (portionIdx !== -1) {
    // If a portion of a food exists, use its quantity
    portion.qty = oldPortions[portionIdx].qty + 1;
  }

  const newMeal = {
    ...oldMeal,
    portions: pureInsert(oldPortions, portion, portionIdx)
  }

  return {
    ...state,
    meals: pureInsert(state.meals, newMeal, mealIdx)
  }
}

/**
 * Remove all portions of the specified `food` from a meal.
 * 
 * @param state The current state.
 * @param mealID The modified meal's ID.
 * @param portion The food to be removed.
 * @returns A new state with `food` removed.
 */
function removePortion(state: AppState, mealID: string, portion: FoodPortion): AppState {
  const mealIdx = state.meals.findIndex(m => m.id === mealID);
  const oldMeal = state.meals[mealIdx];

  const oldPortions = oldMeal.portions;
  const portionIdx = oldPortions.findIndex(p => p.food.id === portion.food.id);

  const newMeal = {
    ...oldMeal,
    portions: pureDelete(oldPortions, portionIdx)
  };

  return {
    ...state,
    meals: pureInsert(state.meals, newMeal, mealIdx)
  }
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'initialize':
      return action.payload;
    case 'setSelectedMeal':
      return {
        ...state,
        selectedMeal: action.payload
      }
    case 'setMeals':
      const meals = action.payload;

      return {
        ...state,

        // Select first meal by default
        selectedMeal: meals.length ? meals[0].id : '',
        meals: meals
      }
    case 'setBlueprints':
      return {
        ...state,
        blueprints: action.payload
      }
    case 'changeDisplayDate':
      return {
        ...state,
        displayDate: action.newDate,
        meals: action.meals
      }
    case 'addPortion':
      return addPortion(state, action.payload);
    case 'removePortion':
      return removePortion(state, action.mealID, action.food);
    default:
      throw new Error('Unknown action');
  }
}
const USER_ID = 'some-user-id';

function saveMeals(meals: Meal[]) {
  meals.forEach(m => API.updateMeal(USER_ID, 'test-project', m));
  console.info('Saved current meals');
}

function App() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [state, dispatch] = useReducer(reducer, {
    selectedMeal: '',
    meals: [],
    blueprints: [],
    displayDate: Timestamp.now(),
    currentProject: '',
  });

  // Load initial data from server
  useEffect(
    () => {
      API.getSession(USER_ID).then(async (session) => {
        const { currentProject, displayDate } = session!;

        const [blueprints, meals] = await Promise.all([
          API.getMealBlueprints(USER_ID, currentProject),
          API.getMeals(USER_ID, currentProject, displayDate)
        ]);

        dispatch({
          type: 'initialize',
          payload: {
            blueprints,
            meals,
            currentProject,
            displayDate,
            selectedMeal: meals.length ? meals[0].id : ''
          }
        });
      });

      API.getFoodList(USER_ID)
        .then(list => setFoods(list));

      API.getFoodCategories(USER_ID)
        .then(categories => setCategories(categories));
    },
    []
  );

  const handleDisplayDateChange = (newDate: Timestamp) => {
    API.getMeals(USER_ID, state.currentProject, newDate)
      .then(meals => dispatch({ type: 'changeDisplayDate', newDate, meals }));
  }

  return (
    <div className='App'>
      <div className='App-menubar'>
        <Menubar
          onSave={() => saveMeals(state.meals)}
        />
      </div>
      <div className='App-columns'>
        <div className='App-column' data-testid='foodlist-col'>
          <FoodList
            data={foods}
            categories={categories}
            onAddPortionClicked={food => dispatch({ type: 'addPortion', payload: food })}
          />
        </div>
        <div className='App-column App-mealList' data-testid='meals-col'>
          <MealDisplay
            meals={state.meals}
            selectedMealTable={state.selectedMeal}
            displayDate={state.displayDate}
            onSelectionChanged={id => dispatch({ type: 'setSelectedMeal', payload: id })}
            onPortionRemoved={(food, mealID) => dispatch({ type: 'removePortion', food, mealID })}
            onDisplayDateChanged={handleDisplayDateChange}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
export type { AppState }
