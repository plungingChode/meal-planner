import type { FoodNutrients, Food, FoodCategory } from './models';
import { ChangeEvent, Fragment, useEffect, useRef } from 'react';

import React, { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

type FoodFilter = (f: Food) => boolean;
type FoodComparatorGen = (n: FoodNutrients, x: number) => FoodFilter;

interface FoodListFilterProps {
  data: Food[],
  categories: FoodCategory[],
  onFilterChanged: (filterFn: FoodFilter) => void;
}

/** Comparison function factories */
const compareFns: Record<string, FoodComparatorGen> = {
  '=': (n, x) => ((f: Food) => Math.abs(f[n] - x) < 1e-4),
  '==': (n, x) => ((f: Food) => Math.abs(f[n] - x) < 1e-4),
  '>': (n, x) => ((f: Food) => f[n] > x),
  '<': (n, x) => ((f: Food) => f[n] < x),
  '>=': (n, x) => ((f: Food) => f[n] >= x),
  '<=': (n, x) => ((f: Food) => f[n] <= x),
};

// TODO use localized keys
/** Shorthands used to refer to nutrients in the search text */
const nutrientKeys: Record<string, FoodNutrients> = {
  'sz': 'carbohydrates',
  'en': 'energy',
  'zs': 'fat',
  'fe': 'protein'
};

// eg. "pr < 5.25" -> [pr, <, 5.25]
const segmentRe = /(.*?)(==|<=|>=|<|>|=)((([1-9][0-9]*)|(0))([.,][0-9]+)?)/i;

/**
 * Attempt to parse a string and create a filter that constrains the value
 * of a nutrient.
 * 
 * @param sgm A string to transform into a filter function
 * @returns A {@link FoodFilter} or null if the transformation fails
 */
function parseConstraint(sgm: string): FoodFilter | null {
  const matches = segmentRe.exec(sgm);
  if (!matches || matches.length < 4) {
    return null;
  }

  const key = nutrientKeys[matches[1]];
  const cmp = matches[2];
  const val = parseFloat(matches[3].replace(',', '.'));

  if (!key || Number.isNaN(val)) {
    return null;
  }

  return compareFns[cmp](key, val) ?? null;
}

/**
 * Create a filter that looks for the `sgm` string in a food's name.
 * 
 * @param sgm A string to transform into a filter function
 * @returns A {@link FoodFilter} or null if the transformation fails
 */
function nameFilter(sgm: string): FoodFilter {
  return (f: Food) => {
    const fname = f.name.toLowerCase().replace(/\s+/, '');
    const search = sgm.toLowerCase().replace(/\s+/, '');

    return fname.includes(search);
  };
}

/** Check if a string could be transformed into a comparison filter */
const containsComparison = (str: string) => /[<=>;]/.test(str);

/**
 * Create a {@link FoodFilter} from text. The text is split at `;` characters and
 * transformed into food name and nutrient constraints.
 * 
 * A nutrient constraint is created by using a nutrient shorthand, a comparison
 * operator and a constraint value. e.g.: `pr < 5` creates a filter that only
 * keeps foods with a `protein` property under 5. Multiple constraints are joined
 * by a logical AND operation.
 * 
 * A name constraint is created by omitting the `<`, `>` and `=` characters from a
 * text segment. In case of multiple such segments, only the first one is used.
 * 
 * @param str A string to transform into a filter function
 * @returns The {@link FoodFilter} represented by `str`
 */
function parseFilter(str: string): FoodFilter {
  const filterParts: FoodFilter[] = [];

  // Empty string means no filter
  if (!str) {
    return () => true;
  }

  if (!containsComparison(str)) {
    // If not a comparison filter, just check the food names
    return nameFilter(str);
  }

  // Parse comparison constraints
  let nameFilterSet = false;
  for (const segment of str.split(';')) {

    // Use first non-comparison part as a name filter
    if (!nameFilterSet && !containsComparison(str)) {
      filterParts.push(nameFilter(segment));
      nameFilterSet = true;
      continue;
    }

    // Try to parse constraints from the other parts
    const fn = parseConstraint(segment.replace(/\s+/g, ''));
    if (fn) {
      filterParts.push(fn);
    }
  }

  // Combine comparisons with logical AND
  return (f: Food) => filterParts.every(fn => fn(f));
}

/** Create an object with `true` assigned to all category IDs */
function allChecked(categories: FoodCategory[]): Record<string, boolean> {
  const chk: Record<string, boolean> = {};
  for (const cat of categories) {
    chk[cat.id] = true;
  }
  return chk;
}

function FoodListFilter(props: FoodListFilterProps) {
  const { categories, onFilterChanged } = props;

  const [textFilter, setTextFilter] = useState<FoodFilter>(() => (() => true));

  // Storing this as a plain object is unsafe, but React warns on 
  // uncontrolled writes anyways
  const [checked, setChecked] = useState(allChecked(categories));

  // Parse filter from input
  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTextFilter(() => parseFilter(e.target.value));
  };
  const debounceTextChange = useDebouncedCallback(handleTextChange, 500);

  // Manage category selection
  const handleCheckChange = (e: ChangeEvent<HTMLInputElement>) => {
    const id = e.target.id.substring(4);
    checked[id] = !checked[id];
    setChecked({ ...checked });
  };

  const toggleAllCategories = () => {
    const checkValues = Object.values(checked);

    if (checkValues.length === categories.length &&
      checkValues.every(v => v === true)) {
      // Only uncheck all when we're sure all of them are selected
      setChecked({});
    }
    else {
      setChecked(allChecked(categories));
    }
  };

  // Initialize all category filters to `checked`
  useEffect(() => setChecked(allChecked(categories)), [setChecked, categories]);

  // Notify of filter update (after initial setup)
  const firstRender = useRef(true);
  useEffect(
    () => {
      if (firstRender.current) {
        firstRender.current = false;
        return;
      }

      // `checked` may be accessed directly, since it always contains
      // all the relevant keys (and therefore is not modified)
      onFilterChanged(f => textFilter(f) && checked[f.category]);
    },
    [textFilter, checked, onFilterChanged]
  );

  return (
    <div>
      <input
        type='text'
        role='search'
        onChange={debounceTextChange}
      />
      <span>
        <button onClick={toggleAllCategories}>mind</button>

        {categories.map(c => (
          <Fragment key={c.id}>
            <input
              type='checkbox'
              id={'fctg' + c.id}
              onChange={handleCheckChange}
              checked={c.id in checked && checked[c.id]}
            />
            <label htmlFor={'fctg' + c.id}>{c.name}</label>
          </Fragment>
        ))}
      </span>
    </div>
  );
}


export default React.memo(FoodListFilter);
export { parseFilter };