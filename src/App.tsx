import type { FoodPortion, FoodRecord, Meal } from './models';

import React, { useEffect, useReducer, useState } from 'react';
import './App.scss';
import FoodList from './FoodList';
import Menubar from './Menubar';
import MealDisplay from './MealDisplay';

import { pureInsert, pureDelete } from './pureutil';
import { getFoodList, getMeals } from './api';

type AppState = {
  selectedMeal: string;
  meals: Meal[];
};

type AppAction =
  | { type: 'setSelectedMeal', payload: string }
  | { type: 'setMeals', payload: Meal[] }
  | { type: 'addPortion', payload: FoodRecord }
  | { type: 'removePortion', food: FoodPortion, mealID: string }

/**
 * Add a portion of `food` to the currently selected meal.
 * 
 * @param state The current state.
 * @param food The food to add.
 * @returns A new state with a portion of `food` added.
 */
function addPortion(state: AppState, food: FoodRecord): AppState {
  const portion = {
    food: food,
    qty: 1
  }
  
  const mealIdx = state.meals.findIndex(m => m.id === state.selectedMeal);
  const oldMeal = state.meals[mealIdx];

  const oldPortions = oldMeal.portions;
  const portionIdx = oldPortions.findIndex(p => p.food.name === food.name);
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
  const portionIdx = oldPortions.findIndex(p => p.food.name === portion.food.name);

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
    case 'setSelectedMeal':
      return {
        ...state,
        selectedMeal: action.payload
      }
    case 'setMeals':
      return {
        ...state,
        meals: action.payload,
      }
    case 'addPortion':
      return addPortion(state, action.payload);
    case 'removePortion':
      return removePortion(state, action.mealID, action.food);
    default:
      throw new Error('Unknown action');
  }
}

function App() {
  const [data, setData] = useState<FoodRecord[]>([]);
  const [state, dispatch] = useReducer(reducer, {
    selectedMeal: '',
    meals: []
  });

  // Load user data from server
  useEffect(() => {
    getFoodList('xxx')
      .then(list => setData(list));
      
    getMeals('xxx', new Date())
      .then(meals => dispatch({ type: 'setMeals', payload: meals }));
  }, [])

return (
  <div className='App'>
    <div className='App-menubar'>
      <Menubar />
    </div>
    <div className='App-columns'>
      <div className='App-column'>
        <FoodList
          data={data}
          onAddPortionClicked={food => dispatch({ type: 'addPortion', payload: food })}
        />
      </div>
      <div className='App-column App-mealList'>
        <MealDisplay
          meals={state.meals}
          selectedMealTable={state.selectedMeal}
          onSelectionChanged={id => dispatch({ type: 'setSelectedMeal', payload: id })}
          onPortionRemoved={(food, mealID) => dispatch({ type: 'removePortion', food, mealID })}
        />
      </div>
    </div>
  </div>
);
}

export default App;
