import type { FoodNutrients, FoodPortion, Meal, NutrientLimits } from './models';

import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Timestamp } from '@firebase/firestore';

import MealTable from './MealTable';
import Footer from './MealDisplayFooter';

import './MealDisplay.scss';

interface MealDisplayProps {
  meals: Meal[];
  selectedMealTable: string;
  displayDate: Timestamp,
  onSelectionChanged: (id: string) => void;
  onPortionRemoved: (food: FoodPortion, mealID: string) => void;
  onDisplayDateChanged: (date: Timestamp) => void;
}

function MealDisplay(props: MealDisplayProps) {
  const {
    meals,
    selectedMealTable,
    displayDate,
    onSelectionChanged,
    onPortionRemoved,
    onDisplayDateChanged,
  } = props;

  // Need to manage value manually to not trigger change event
  const dateInput = useRef<HTMLInputElement>(null);

  useEffect(
    () => {
      const jsdate = displayDate.toDate();
      const offsetDate = new Date(jsdate.getTime() - (jsdate.getTimezoneOffset() * 60000));
      dateInput.current!.value = offsetDate.toISOString().substring(0, 10);
    },
    [displayDate]
  );

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const date = e.target.valueAsDate;
    if (!date) {
      return;
    }
    // TODO this is probably not a good idea
    date.setHours(0);
    onDisplayDateChanged(Timestamp.fromMillis(date.getTime()));
  };

  return (
    <>
      <div>
        <label htmlFor='mealdisplay-date'>???</label>
        <input
          type='date'
          id='mealdisplay-date'
          ref={dateInput}
          onChange={handleDateChange}
        />
        {/* TODO add switch project btn */}
        {/* TODO add new meal btn <button>+</button> */}
      </div>
      <div className='MealDisplay-meals'>
        {meals.map(meal => (
          <MealTable
            key={meal.id}
            meal={meal}
            onPortionRemoved={onPortionRemoved}
            onQuantityChanged={() => { }}
            onSelect={onSelectionChanged}
            selected={meal.id === selectedMealTable}
          />
        ))}
      </div>
      <Footer
        meals={meals}
      />
    </>
  );
}

export default MealDisplay;