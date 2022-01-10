import type { FoodPortion, FoodRecord, Meal, NutrientLimits } from './models';

import React from 'react';
import { render, screen, getAllByRole, getByRole, getByTestId } from '@testing-library/react';
import { Simulate } from 'react-dom/test-utils';

import FoodList from './FoodList';

describe('FoodList', () => {
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
  // #endregion

  // Set screen width & height for react-virtualized-auto-sizer
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 500 });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 500 });
  });

  test('addPortion works correctly', () => {
    const onAddAmountHovered = jest.fn((hovered: boolean) => {});
    const onAddPortionClicked = jest.fn((food: FoodRecord) => {});
    const onAddUnitClicked = jest.fn((food: FoodRecord) => {});

    render(
      <FoodList 
        data={food}
        onAddAmountHovered={onAddAmountHovered}
        onAddPortionClicked={onAddPortionClicked}
        // TODO onAddUnitClicked={} 
      />
    );

    const tableBody = screen.getByRole('rowgroup');
    const firstRow = getAllByRole(tableBody, 'row')[0];
    const firstRowCells = getAllByRole(firstRow, 'cell');
    const lastCell = firstRowCells[firstRowCells.length - 1];
    const [addPortion, addUnit] = getAllByRole(lastCell, 'button');

    Simulate.mouseEnter(addPortion);
    expect(onAddAmountHovered).toBeCalledWith(true);
    Simulate.mouseLeave(addPortion);
    expect(onAddAmountHovered).toBeCalledWith(false);
    Simulate.click(addPortion);
    expect(onAddPortionClicked).toBeCalledWith(food[0]);
  });
});