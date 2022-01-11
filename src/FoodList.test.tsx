import type { FoodPortion, FoodRecord, Meal, NutrientLimits } from './models';

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { Simulate } from 'react-dom/test-utils';
import { food, limits, meal } from './__mocks__/mockData';

import FoodList from './FoodList';

describe('FoodList', () => {
  // Set screen width & height for react-virtualized-auto-sizer
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 500 });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 500 });
  });

  test('addPortion works correctly', () => {
    const onAddAmountHovered = jest.fn((hovered: boolean) => { });
    const onAddPortionClicked = jest.fn((food: FoodRecord) => { });
    const onAddUnitClicked = jest.fn((food: FoodRecord) => { });

    render(
      <FoodList
        data={food}
        onAddAmountHovered={onAddAmountHovered}
        onAddPortionClicked={onAddPortionClicked}
      // TODO onAddUnitClicked={} 
      />
    );

    const tableBody = screen.getByRole('rowgroup');
    const firstRow = within(tableBody).getAllByRole('row')[0];
    const firstRowCells = within(firstRow).getAllByRole('cell');
    const lastCell = firstRowCells[firstRowCells.length - 1];
    const [addPortion, addUnit] = within(lastCell).getAllByRole('button');

    Simulate.mouseEnter(addPortion);
    expect(onAddAmountHovered).toBeCalledWith(true);
    Simulate.mouseLeave(addPortion);
    expect(onAddAmountHovered).toBeCalledWith(false);
    Simulate.click(addPortion);
    expect(onAddPortionClicked).toBeCalledWith(food[0]);
  });
});