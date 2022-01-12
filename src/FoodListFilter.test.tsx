import type { Food, Meal, NutrientLimits } from './models';

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { Simulate } from 'react-dom/test-utils';
import { food, limits, meal, categories } from './__mocks__/mockData';

import FoodListFilter, { parseFilter } from './FoodListFilter';

function lastCallParam(fn: jest.Mock<any, any>) {
  return fn.mock.calls[fn.mock.calls.length - 1][0];
}

describe('FoodList filter', () => {
  test('displays all categories, selected as default', () => {
    render(
      <FoodListFilter 
        data={food}
        categories={categories}
        onFilterChanged={() => {}}
      />
    );

    // Checkbox presence
    const checkboxes = screen.getAllByRole<HTMLInputElement>('checkbox');
    expect(checkboxes.length).toBe(categories.length);

    // Checked by default
    const allChecked = checkboxes.every(cb => cb.checked === true);
    expect(allChecked).toBeTruthy();

    // Checkbox labels
    categories.forEach(ctg => {
      const label = screen.getByLabelText(ctg.name);
      expect(label).toBeInTheDocument();
    });
  });

  test('only updates filter after initial render', () => {
    const mockFilterChanged = jest.fn();
    
    render(
      <FoodListFilter 
        data={food}
        categories={categories}
        onFilterChanged={mockFilterChanged}
      />
    );

    expect(mockFilterChanged).toBeCalledTimes(1);
  });

  test('toggling categories updates the filter', async () => {
    const mockFilterChanged = jest.fn();

    render(
      <FoodListFilter 
        data={food}
        categories={categories}
        onFilterChanged={mockFilterChanged}
      />
    );

    const checkboxes = screen.getAllByRole<HTMLInputElement>('checkbox');
    
    // Unchecking the first checkbox filters out foods of that category
    Simulate.change(checkboxes[0]);
    await waitFor(() => expect(mockFilterChanged).toBeCalledTimes(2));
    const actualFilter = lastCallParam(mockFilterChanged);

    let expected = food.filter(f => categories.slice(1).find(ctg => f.category === ctg.id));
    let actual = food.filter(actualFilter);

    expect(actual).toEqual(expected);

    // Checking it again resets the filter
    Simulate.change(checkboxes[0]);
    await waitFor(() => expect(mockFilterChanged).toBeCalledTimes(3));
    const resetFilter = lastCallParam(mockFilterChanged);

    expected = food;
    actual = food.filter(resetFilter);

    expect(actual).toEqual(expected);
  });

  test('toggle all button works correctly', async () => {
    const mockFilterChanged = jest.fn();

    render(
      <FoodListFilter 
        data={food}
        categories={categories}
        onFilterChanged={mockFilterChanged}
      />
    );

    const checkboxes = screen.getAllByRole<HTMLInputElement>('checkbox');
    const toggleAllBtn = screen.getByRole('button');
    
    // Clicking `Toggle all` when all categories are selected should
    // unselect all of them  
    Simulate.click(toggleAllBtn);
    const noneChecked = checkboxes.every(cb => cb.checked === false);
    expect(noneChecked).toBeTruthy();

    // The second callback is called with an always falsy fn
    await waitFor(() => expect(mockFilterChanged).toBeCalledTimes(2));
    const falsyFilter = lastCallParam(mockFilterChanged);
    expect(food.filter(falsyFilter).length).toBe(0);

    // Clicking `Toggle all` when no categories are selected should
    // select all of them
    Simulate.click(toggleAllBtn);
    const allChecked = checkboxes.every(cb => cb.checked === true);
    expect(allChecked).toBeTruthy();

    await waitFor(() => expect(mockFilterChanged).toBeCalledTimes(3));
    const truthyFilter = lastCallParam(mockFilterChanged);
    expect(food.filter(truthyFilter).length).toBe(food.length);
  });

  test('mixing toggle all and checkbox changes works correctly', () => {
    const mockFilterChanged = jest.fn();

    render(
      <FoodListFilter 
        data={food}
        categories={categories}
        onFilterChanged={mockFilterChanged}
      />
    );

    const checkboxes = screen.getAllByRole<HTMLInputElement>('checkbox');
    const toggleAllBtn = screen.getByRole('button');

    // Clicking `Toggle all` when any categories are selected should 
    // select all of them
    Simulate.click(toggleAllBtn);
    Simulate.change(checkboxes[0]);
    Simulate.click(toggleAllBtn);

    const allChecked = checkboxes.every(cb => cb.checked === true);
    expect(allChecked).toBeTruthy();
  });

  test('correctly parses input text', async () => {
    const mockFilterChanged = jest.fn();

    render(
      <FoodListFilter 
        data={food}
        categories={categories}
        onFilterChanged={mockFilterChanged}
      />
    );

    const filterInput = screen.getByRole<HTMLInputElement>('search');

    // Need to wait at least 500ms after input, because we're debouncing
    // the text update
    let callCount = mockFilterChanged.mock.calls.length;
    const setFilterText = async (text: string) => {
      Simulate.change(filterInput, { target: { value: text }} as any);
      await waitFor(() => expect(mockFilterChanged).toBeCalledTimes(callCount));
      callCount += 1;
    };
    
    // Clearing the filter input resets the filter
    await setFilterText('aaaa');
    await setFilterText('');

    let filterFn = lastCallParam(mockFilterChanged);
    expect(food.filter(filterFn)).toEqual(food);

    // TODO make language-independent
    // Typing nutrient constraint key phrases gets parsed as filters
    await setFilterText('fe > 1');
    filterFn = lastCallParam(mockFilterChanged);
    expect(food.filter(filterFn)).toEqual(food.filter(f => f.protein > 1));

    await setFilterText('a');
    filterFn = lastCallParam(mockFilterChanged);
    let expected = food.filter(f => f.name.toLowerCase().includes('a'));
    expect(food.filter(filterFn)).toEqual(expected);
    
    await setFilterText('zs <= 1');
    filterFn = lastCallParam(mockFilterChanged);
    expect(food.filter(filterFn)).toEqual(food.filter(f => f.fat <= 1));

    // TODO test ALL cases??
  });
});