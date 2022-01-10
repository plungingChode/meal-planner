import type { FoodPortion, Meal } from './models';

import React from 'react';
import MealTable from './MealTable';

interface MealDisplayProps {
  meals: Meal[];
  selectedMealTable: string;
  onSelectionChanged: (id: string) => void;
  onPortionRemoved: (food: FoodPortion, mealID: string) => void;
}

function MealDisplay(props: MealDisplayProps) {
  const {meals} = props;

  return (
    <>
      {meals.map(meal => (
        <MealTable
          key={meal.id}
          meal={meal}
          onPortionRemoved={props.onPortionRemoved}
          onQuantityChanged={() => { }}
          onSelect={props.onSelectionChanged}
          selected={meal.id === props.selectedMealTable}
        />
      ))}
    </>
  );
}

export default MealDisplay;