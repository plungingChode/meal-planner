
import type { FoodNutrients, FoodPortion, Meal, NutrientLimits } from './models';

import React, { useEffect, useState } from 'react';
import useScrollbarSize from 'react-scrollbar-size';

import MealTableFooterCell from './MealTableFooterCell';

import './MealDisplayFooter.scss';

interface MealDisplayFooterProps {
  meals: Meal[]
}

interface CombinedMeal {
  portions: FoodPortion[];
  limits: Required<NutrientLimits>;
}

const nutrients: readonly FoodNutrients[] = [
  'energy', 'carbohydrates', 'protein', 'fat'
] as const;

function combineMeals(meals: Meal[]): CombinedMeal {
  let portionSum = [] as FoodPortion[];
  let limitSum = {} as Required<NutrientLimits>;

  for (const n of nutrients) {
    limitSum[n] = { min: 0, max: 0 };
  }
  for (const { portions, limits } of meals) {
    // Concatenate portions
    portionSum = [...portionSum, ...portions];

    // Sum limits by nutrient
    for (const n of nutrients) {
      const { min, max } = limits[n];
      if (typeof min !== 'undefined' && Number.isFinite(min)) {
        limitSum[n].min! += min;
      }
      if (typeof max !== 'undefined' && Number.isFinite(max)) {
        limitSum[n].max! += max;
      }
    }
  }

  return {
    portions: portionSum,
    limits: limitSum
  };
}

function MealDisplayFooter(props: MealDisplayFooterProps) {
  const { meals } = props;
  const { width: scrollbarWidth } = useScrollbarSize(); 
  const [combinedMeal, setCombinedMeal] = useState(combineMeals(meals));

  useEffect(
    () => setCombinedMeal(combineMeals(meals)),
    [meals]
  );

  return (
    <div className='DataTable-responsiveWrapper MealDisplay-footer'>
      <div className='DataTable-wrapper'>
        <div className='DataTable'>
          <div className='DataTable-row MealTable-row' style={{ marginRight: scrollbarWidth + 'px' }}>
            <div></div>
            <div></div>
            <div></div>
            {nutrients.map(n => (
              <div key={n}>
                <MealTableFooterCell
                  portions={combinedMeal.portions}
                  limits={combinedMeal.limits}
                  nutrientKey={n}
                />
              </div>
            ))}
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MealDisplayFooter;
