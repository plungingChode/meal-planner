import type { FoodNutrients, FoodPortion, NutrientLimits, Interval } from './models';

import React from 'react';
import cx from 'classnames';
import { formatNutrient } from './FoodListTable';

import './MealTableFooterCell.scss';

interface MealTableFooterCellProps {
  portions: readonly FoodPortion[];
  limits: NutrientLimits;
  nutrientKey: FoodNutrients;
}

interface ExtractedLimits {
  min: number;
  minStr: string;
  max: number;
  maxStr: string;
}

function calculateNutrientSum(ps: readonly FoodPortion[], n: FoodNutrients) {
  let sum = 0;
  for (const p of ps) {
    sum += p.food[n] * p.qty;
  }
  return sum;
}

function extractLimits(limits: NutrientLimits, n: FoodNutrients): ExtractedLimits {
  switch (typeof limits[n]) {
    case 'number':
      const limit = limits[n] as number;

      return {
        min: Number.NEGATIVE_INFINITY,
        minStr: '-',
        max: limit,
        maxStr: '< ' + formatNutrient(limit, n, false),
      }
    case 'object':
      const { max, min } = limits[n] as Interval;

      const maxStr = max !== Number.POSITIVE_INFINITY
        ? '< ' + formatNutrient(max, n, false)
        : '-'

      return {
        min: min,
        minStr: '> ' + formatNutrient(min, n, false),
        max: max,
        maxStr: maxStr,
      }
    default:
      return {
        min: Number.NEGATIVE_INFINITY,
        minStr: '?',
        max: Number.POSITIVE_INFINITY,
        maxStr: '?',
      }
  }
}

function MealTableFooterCell(props: MealTableFooterCellProps) {
  const { portions, limits, nutrientKey } = props;

  const nutrientSum = calculateNutrientSum(portions, nutrientKey);
  const displayLimits = extractLimits(limits, nutrientKey);

  const tooHigh = displayLimits.max < nutrientSum;
  const tooLow = displayLimits.min > nutrientSum;

  return (
    <>
      <span className={cx('MealTableFooter-limit', { tooHigh })} data-testid='mtfc-max'>
        {displayLimits.maxStr}
      </span>
      <span className={cx('MealTableFooter-sum', { tooHigh, tooLow })} data-testid='mtfc-actual'>
        {formatNutrient(nutrientSum, nutrientKey)}
      </span>
      <span className={cx('MealTableFooter-limit', { tooLow })} data-testid='mtfc-min'>
        {displayLimits.minStr}
      </span>
    </>
  )
}

export default MealTableFooterCell;
export {
  calculateNutrientSum,
  extractLimits
}