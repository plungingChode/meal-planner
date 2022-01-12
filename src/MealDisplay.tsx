import type { FoodNutrients, FoodPortion, Meal, NutrientLimits } from './models';

import React, { useEffect, useState } from 'react';
import MealTable from './MealTable';
import MealTableFooterCell from './MealTableFooterCell';

import MealDisplayFooter from './MealDisplayFooter';

import './MealDisplay.scss';

interface MealDisplayProps {
  meals: Meal[];
  selectedMealTable: string;
  onSelectionChanged: (id: string) => void;
  onPortionRemoved: (food: FoodPortion, mealID: string) => void;
}

function MealDisplay(props: MealDisplayProps) {
  const { meals } = props;

  return (
    <>
      <div className='MealDisplay-meals'>
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
      </div>
      <MealDisplayFooter
        meals={meals}
      />
    </>
  );
}

export default MealDisplay;