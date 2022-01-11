import type { FoodRecord, Meal, NutrientLimits } from './models';

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { Simulate } from 'react-dom/test-utils';

jest.mock('./api');
import API from './api';
import App from './App';

// #region Mock data
const food: FoodRecord[] = [
  {
    id: 'A',
    name: "A",
    category: 1,
    refAmount: 1,
    refUnit: "g",
    portionMultiplier: 1.0,
    energy: 1,
    carbohydrates: 1,
    protein: 1,
    fat: 1,
    comment: "-"
  },
  {
    id: 'B',
    name: "B",
    category: 2,
    refAmount: 2,
    refUnit: "g",
    portionMultiplier: 0.5,
    energy: 2,
    carbohydrates: 2,
    protein: 2,
    fat: 2,
    comment: "-"
  }
];

const limits: NutrientLimits = {
  energy: 1,
  carbohydrates: { min: 1, max: 2 },
  protein: { min: 99, max: Number.POSITIVE_INFINITY },
  fat: 0,
}

const meal: Meal = {
  id: 'meal-1',
  name: 'Meal 1',
  portions: [
    { food: food[0], qty: 1 },
    { food: food[1], qty: 1 },
  ],
  limits: limits,
  date: new Date(2001, 0, 13),
}
// #endregion

describe('App', () => {
  // Set screen width & height for react-virtualized-auto-sizer
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 500 });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 500 });
  });

  // need waitFor updates after render, since data is loaded on app startup
  test('loads and displays inital food list', async () => {
    render(<App />);

    await waitFor(() => {
      const foodListColumn = screen.getByTestId('foodlist-col');
      const foodListBody = within(foodListColumn).getByRole('rowgroup');
      const foodListRows = within(foodListBody).getAllByRole('row');

      // Food names in second column
      const actualNames = foodListRows.map(row => within(row).getAllByRole('cell')[1].textContent);
      const expectedNames = food.map(f => f.name);
      expect(actualNames).toEqual(expectedNames);
    })
  });

  test('loads and displays initial meal list', async () => {
    render(<App />);

    await waitFor(() => {
      const mealsColumn = screen.getByTestId('meals-col');
      const mealsBody = within(mealsColumn).getByRole('rowgroup');
      const mealsRows = within(mealsBody).getAllByRole('row');

      // Meal title should be displayed
      const titleElement = within(mealsColumn).getByText(meal.name);
      expect(titleElement).toBeInTheDocument();

      // Food names in second column
      const actualNames = mealsRows.map(row => within(row).getAllByRole('cell')[1].textContent);
      const expectedNames = meal.portions.map(p => p.food.name);

      expect(actualNames).toEqual(expectedNames);
    });
  });

  test('adds portion to meal (selected by default)', async () => {
    jest.spyOn(API, 'getMeals').mockResolvedValueOnce([{ ...meal, portions: [] }]);

    render(<App />);

    await waitFor(() => {
      // FoodList with foods "A" and "B"
      const foodListColumn = screen.getByTestId('foodlist-col');
      const foodListBody = within(foodListColumn).getByRole('rowgroup');
      const foodListRows = within(foodListBody).getAllByRole('row');
      const addPortionButton_A = within(foodListRows[0]).getAllByRole('button')[0];

      // Single meal with no portions
      const mealsColumn = screen.getByTestId('meals-col');
      const mealsBody = within(mealsColumn).getByRole('rowgroup');

      // Add a new "A" food to the default selected meal
      Simulate.click(addPortionButton_A);
      // ...this should add a new row, with a single portion
      const mealsRows = within(mealsBody).getAllByRole('row');
      expect(mealsRows[0]).toBeInTheDocument();
      expect(within(mealsRows[0]).getAllByRole('cell')[2].textContent).toContain('1');

      // Add another "A" food to the default selected meal
      Simulate.click(addPortionButton_A);
      // ... this should add no new rows, but increase the portion count
      expect(mealsRows.length).toBe(1);
      expect(within(mealsRows[0]).getAllByRole('cell')[2].textContent).toContain('2');
    });
  });
});
