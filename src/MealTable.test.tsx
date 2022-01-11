import type { FoodPortion, FoodRecord, Meal, NutrientLimits } from './models';

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { Simulate } from 'react-dom/test-utils';

import MealTable from './MealTable';
import MealTableFooterCell from './MealTableFooterCell';

describe('MealTable', () => {
  // #region Mock data
  const food: FoodRecord[] = [
    {
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

  // TODO test onQuantityChanged
  describe('Table rows', () => {
    const removePortion = jest.fn();

    render(
      <MealTable
        meal={meal}
        onQuantityChanged={() => { }}
        onPortionRemoved={removePortion}
      />
    );

    test('onPortionRemoved is called', () => {
      const tableBody = screen.getByRole('rowgroup');
      const firstRow = within(tableBody).getAllByRole('row')[0];
      const firstRowCells = within(firstRow).getAllByRole('cell');
      const lastCell = firstRowCells[firstRowCells.length - 1];

      const removeButton = within(lastCell).getByRole('button');

      Simulate.click(removeButton);
      expect(removePortion).toBeCalledTimes(1);
      expect(removePortion).toBeCalledWith(meal.portions[0], meal.id);
    });
  });

  describe('Footer', () => {
    test('dispalys unset limits correctly', () => {
      render(
        <MealTableFooterCell
          portions={meal.portions}
          limits={{} as any}
          nutrientKey='carbohydrates'
        />
      );

      const maxDisplay = screen.getByTestId('mtfc-max');
      const actDisplay = screen.getByTestId('mtfc-actual');
      const minDisplay = screen.getByTestId('mtfc-min');

      expect(maxDisplay).toHaveTextContent('?');
      expect(actDisplay).toHaveTextContent('3.00g');
      expect(minDisplay).toHaveTextContent('?');
    });

    test('displays interval limits correctly (over max)', () => {
      render(
        <MealTableFooterCell
          portions={meal.portions}
          limits={meal.limits}
          nutrientKey='carbohydrates'
        />
      );

      const maxDisplay = screen.getByTestId('mtfc-max');
      const actDisplay = screen.getByTestId('mtfc-actual');
      const minDisplay = screen.getByTestId('mtfc-min');

      expect(maxDisplay).toHaveTextContent('< 2.00');
      expect(maxDisplay).toHaveClass('tooHigh');
      expect(actDisplay).toHaveTextContent('3.00g');
      expect(actDisplay).toHaveClass('tooHigh');
      expect(minDisplay).toHaveTextContent('> 1.00');
    });

    test('displays interval limits correctly (under min)', () => {
      render(
        <MealTableFooterCell
          portions={meal.portions}
          limits={meal.limits}
          nutrientKey='protein'
        />
      );

      const maxDisplay = screen.getByTestId('mtfc-max');
      const actDisplay = screen.getByTestId('mtfc-actual');
      const minDisplay = screen.getByTestId('mtfc-min');

      expect(maxDisplay).toHaveTextContent('-');
      expect(actDisplay).toHaveTextContent('3.00g');
      expect(actDisplay).toHaveClass('tooLow');
      expect(minDisplay).toHaveTextContent('> 99.00');
      expect(minDisplay).toHaveClass('tooLow');
    });


    test('displays number only limits correctly', () => {
      render(
        <MealTableFooterCell
          portions={meal.portions}
          limits={meal.limits}
          nutrientKey='energy'
        />
      );

      const maxDisplay = screen.getByTestId('mtfc-max');
      const actDisplay = screen.getByTestId('mtfc-actual');
      const minDisplay = screen.getByTestId('mtfc-min');

      expect(maxDisplay).toHaveTextContent('< 1');
      expect(maxDisplay).toHaveClass('tooHigh');
      expect(actDisplay).toHaveTextContent('3kcal');
      expect(actDisplay).toHaveClass('tooHigh');
      expect(minDisplay).toHaveTextContent('-');
    });
  });
});
