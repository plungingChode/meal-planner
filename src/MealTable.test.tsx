import type { FoodPortion, Food, Meal, NutrientLimits } from './models';

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { Simulate } from 'react-dom/test-utils';
import { food, limits, meal } from './__mocks__/mock-data';

import MealTable from './MealTable';
import MealTableFooterCell from './MealTableFooterCell';

describe('MealTable', () => {
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
  });
});
