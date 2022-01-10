import type { CellProps, Column, TableInstance, TableOptions } from 'react-table';
import type { FoodRecord, FoodPortion, FoodNutrients, NutrientLimits, Meal } from './models';

import React from 'react';
import { useTable } from 'react-table';
import FooterCell from './MealTableFooterCell';
import cx from 'classnames';

import './MealTable.scss'


interface MealTableProps {
  meal: Meal;
  onQuantityChanged: (food: FoodRecord) => void;
  onPortionRemoved: (food: FoodPortion, mealID: string) => void;
  onScrollYChanged?: (e: React.UIEvent) => void;
  scrollY?: number;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

const BUTTER_ICON = '🧈';
const EGG_ICON = '🥚';
const LIGHTNING_ICON = '⚡';
const BREAD_ICON = '🍞';

type FooterProps<D extends object> = 
  & TableInstance<D> 
  & { limits: NutrientLimits, nutrientKey: FoodNutrients }; 

type ActionCellProps<D extends object> = 
  & CellProps<D, null>
  & { 
    mealID: string;
    onQuantityChanged: (food: FoodRecord) => void;
    onPortionRemoved: (food: FoodPortion, mealID: string) => void;
  }

function calculateNutrient(p: FoodPortion, n: FoodNutrients) {
  return p.food[n] * p.qty;
}

const columns: Column<FoodPortion>[] = [
  {
    id: 'category',
    accessor: (p: FoodPortion) => p.food.category,
    // Header: 'C',
  },
  {
    id: 'name',
    accessor: (p: FoodPortion) => p.food.name
    // Header: 'Name',
  },
  {
    // TODO display no. of portions AND volume/weight with unit
    id: 'quantity',
    accessor: 'qty',
    // Header: 'Qty',
    Cell: (c: CellProps<FoodPortion, number>) => c.value + ' adag',
  },
  {
    id: 'energy',
    accessor: (p: FoodPortion) => calculateNutrient(p, 'energy'),
    Header: LIGHTNING_ICON,
    Cell: (c: CellProps<FoodPortion, number>) => c.value.toFixed(0) + 'kcal',
    Footer: (f: FooterProps<FoodPortion>) => FooterCell({
      portions: f.data,
      limits: f.limits,
      nutrientKey: 'energy'
    })
  },
  {
    id: 'carbohydrates',
    accessor: (p: FoodPortion) => calculateNutrient(p, 'carbohydrates'),
    Header: BREAD_ICON,
    Cell: (c: CellProps<FoodPortion, number>) => c.value.toFixed(2) + 'g',
    Footer: (f: FooterProps<FoodPortion>) => FooterCell({
      portions: f.data,
      limits: f.limits,
      nutrientKey: 'carbohydrates'
    })
  },
  {
    id: 'protein',
    accessor: (p: FoodPortion) => calculateNutrient(p, 'protein'),
    Header: EGG_ICON,
    Cell: (c: CellProps<FoodPortion, number>) => c.value.toFixed(2) + 'g',
    Footer: (f: FooterProps<FoodPortion>) => FooterCell({
      portions: f.data,
      limits: f.limits,
      nutrientKey: 'protein'
    })
  },
  {
    id: 'fat',
    accessor: (p: FoodPortion) => calculateNutrient(p, 'fat'),
    Header: BUTTER_ICON,
    Cell: (c: CellProps<FoodPortion, number>) => c.value.toFixed(2) + 'g',
    Footer: (f: FooterProps<FoodPortion>) => FooterCell({
      portions: f.data,
      limits: f.limits,
      nutrientKey: 'fat'
    })
  },
  {
    id: 'actions',
    Cell: (c: ActionCellProps<FoodPortion>) => (
      <button onClick={() => c.onPortionRemoved(c.row.original, c.mealID)}>x</button>
    )
  }
];

function MealTable(props: MealTableProps) {
  const {
    onPortionRemoved,
    onQuantityChanged,
    onSelect
  } = props;

  const tableInstance = useTable({ 
    columns, 
    data: props.meal.portions,
    onPortionRemoved,
    onQuantityChanged,
    mealID: props.meal.id
  } as TableOptions<FoodPortion>);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    footerGroups,
    rows,
    prepareRow
  } = tableInstance;

  if (props.meal.id === 'reggeli-1') {
    console.log('reggeli-1', props.meal.portions);
  }

  // TODO link scrollY to other MealTables
  return (
    <div 
      className={cx(
        'DataTable-responsiveWrapper', 
        'MealTable', 
        { 
          'MealTable-selected': props.selected 
        }
      )}
      onClick={() => onSelect && onSelect(props.meal.id)}
      style={{marginBottom: '1rem'}}
    >
      <div className='DataTable-wrapper'>
        <div {...getTableProps({ className: 'DataTable' })}>
          <div className='MealTable-titleBar'>
            {props.meal.name}

            {/* Action buttons */}
            <span className='MealTable-actions'>
              <button>E</button>
              <button>/\</button>
              <button>\/</button>
              <button>D</button>
            </span>
          </div>
          {headerGroups.map(group => (
            <div  {...group.getHeaderGroupProps({ className: 'MealTable-header DataTable-header' })}>
              {group.headers.map((column: any) => {
                // column = column as SortableColumn<FoodPortion>;
                return (
                  <div {...column.getHeaderProps()}>
                    {column.render('Header')}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Table body */}
          <div {...getTableBodyProps({ className: 'MealTable-body' })}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <div {...row.getRowProps({ className: 'DataTable-row striped MealTable-row' })}>
                  {row.cells.map(cell => (
                    // TODO display actual values as tooltip
                    <div {...cell.getCellProps()} className='MealTable-cell'>
                      {cell.render('Cell')}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>

          {/* Footer */}
          {footerGroups.map(group => (
            <div {...group.getFooterGroupProps()} className='DataTable-row MealTable-row footer'>
              {group.headers.map(column => (
                <div {...column.getFooterProps()}>
                  {column.render('Footer', { limits: props.meal.limits })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MealTable;