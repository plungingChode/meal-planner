import {
  Food,
  FoodCategory,
  FoodPortion,
  Meal,
  MealBlueprint,
  ProjectDefinition
} from './models';

import React, { useEffect, useReducer } from 'react';
import { Timestamp } from '@firebase/firestore';
import { pureInsert, pureDelete } from './pureutil';
import API from './api';

import FoodList from './FoodList';
import Menubar from './Menubar';
import MealDisplay from './MealDisplay';

import './App.scss';

type AppState = {
  currentProject: ProjectDefinition | null;
  blueprints: MealBlueprint[];
  meals: Meal[];
  displayDate: Timestamp | null;
  selectedMeal: string;

  // Rarely updated fields
  foods: Food[];
  categories: FoodCategory[];
  projects: ProjectDefinition[];
};

interface SetProjectArgs {
  currentProject: ProjectDefinition | null;
  displayDate: Timestamp | null;
  meals: Meal[];
  blueprints: MealBlueprint[];
}

type AppAction =
  | { type: 'initialize', payload: AppState }
  | { type: 'setSelectedMeal', payload: string }
  | { type: 'setMeals', payload: Meal[] }
  | { type: 'setBlueprints', payload: MealBlueprint[] }
  | { type: 'addPortion', payload: Food }
  | { type: 'removePortion', food: FoodPortion, mealID: string }
  | { type: 'changeDisplayDate', newDate: Timestamp, meals: Meal[] }
  | { type: 'setProject', payload: SetProjectArgs }
  | { type: 'setFoodList', payload: Food[] }
  | { type: 'setCategoryList', payload: FoodCategory[] }
  | { type: 'setProjectList', payload: ProjectDefinition[] }

// #region Reducer helper functions
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

/** Returns the first meal's ID or an empty string if no meals are present */
function firstMealID(meals: Meal[]) {
  return meals && meals.length
    ? meals[0].id
    : '';
}
// #endregion

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
      return {
        ...state,

        // Select first meal by default
        selectedMeal: firstMealID(action.payload),
        meals: action.payload,
      }
    case 'setBlueprints':
      return {
        ...state,
        blueprints: action.payload
      }
    case 'addPortion':
      return addPortion(state, action.payload);
    case 'removePortion':
      return removePortion(state, action.mealID, action.food);
    case 'changeDisplayDate':
      return {
        ...state,
        displayDate: action.newDate,
        meals: action.meals,
        selectedMeal: firstMealID(action.meals),
      }
    case 'setProject':
      return {
        ...state,
        ...action.payload,
        selectedMeal: firstMealID(action.payload.meals),
      }
    case 'setFoodList':
      return {
        ...state,
        foods: action.payload
      }
    case 'setCategoryList':
      return {
        ...state,
        categories: action.payload
      }
    case 'setProjectList':
      return {
        ...state,
        projects: action.payload
      }
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
  const [state, dispatch] = useReducer(reducer, {
    currentProject: null,
    blueprints: [],
    meals: [],
    displayDate: Timestamp.now(),
    selectedMeal: '',

    foods: [],
    categories: [],
    projects: [],
  });

  // Load initial data from server
  useEffect(() => {
    (async () => {
      // Start loading foodlist & categories
      const getFoodList = API.getFoodList(USER_ID);
      const getCategories = API.getFoodCategories(USER_ID);

      const [session, projects] = await Promise.all([
        API.getSession(USER_ID),
        API.getProjects(USER_ID),
      ]);

      if (!projects || !projects.length) {
        // TODO handle empty project list
        return;
      }

      if (!session) {
        // TODO handle missing session
        return;
      }

      // Load last edited project
      const { currentProject: lastProjectID, displayDate } = session;
      const results = await Promise.all([
        API.getMealBlueprints(USER_ID, lastProjectID),
        API.getMeals(USER_ID, lastProjectID, displayDate),
        getFoodList,
        getCategories,
      ]);
      const [blueprints, meals, foods, categories] = results;
      const currentProject = projects.find(p => p.id === lastProjectID) || null;

      dispatch({
        type: 'initialize',
        payload: {
          currentProject,
          blueprints,
          meals,
          displayDate,
          selectedMeal: firstMealID(meals),

          foods,
          categories,
          projects,
        }
      });
    })();
  }, []);

  // 
  const handleAddPortion = (f: Food) => (
    dispatch({ type: 'addPortion', payload: f })
  );
  const handleRemovePortion = (food: FoodPortion, mealID: string) => (
    dispatch({ type: 'removePortion', food, mealID })
  );
  const handleMealSelection = (id: string) => (
    dispatch({ type: 'setSelectedMeal', payload: id })
  );
  const handleDisplayDateChange = (newDate: Timestamp) => {
    if (!state.currentProject) {
      return;
    }
    API.getMeals(USER_ID, state.currentProject.id!, newDate)
      .then(meals => dispatch({ type: 'changeDisplayDate', newDate, meals }));
  }

  // Menu actions
  const handleSaveAction = () => saveMeals(state.meals);

  return (
    <div className='App'>
      <div className='App-menubar'>
        <Menubar
          onSave={handleSaveAction}
        />
      </div>
      <div className='App-columns'>
        <div className='App-column' data-testid='foodlist-col'>
          <FoodList
            data={state.foods}
            categories={state.categories}
            onAddPortionClicked={handleAddPortion}
          />
        </div>
        <div className='App-column App-mealList' data-testid='meals-col'>
          <MealDisplay
            meals={state.meals}
            selectedMealTable={state.selectedMeal}
            displayDate={state.displayDate!}
            onSelectionChanged={handleMealSelection}
            onPortionRemoved={handleRemovePortion}
            onDisplayDateChanged={handleDisplayDateChange}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
export type { AppState }
