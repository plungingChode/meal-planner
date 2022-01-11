import type { FoodNutrients, Food } from './models';
import type { Column, CellProps, TableOptions } from 'react-table';

import React, { useCallback } from 'react'
import FoodListActions from './FoodListActions';
import { useTable } from 'react-table';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import cx from 'classnames';

import './FoodList.scss';

interface FoodListTableProps {
  data: Food[],
  onAddAmountHovered?: (hovered: boolean) => void;
  onAddPortionClicked?: (record: Food) => void;
  onAddUnitClicked?: () => void;
}

type ActionCellProps<D extends object> = CellProps<D, null> & {
  onAddAmountHovered?: (hovered: boolean) => void;
  onAddPortionClicked?: (record: Food) => void;
  onAddUnitClicked?: () => void;
}

function formatNutrient(value: number, n: FoodNutrients, withUnit = true) {
  switch (n) {
    case 'energy':
      return value.toFixed(0) + (withUnit ? 'kcal' : '');
    default:
      return value.toFixed(2) + (withUnit ? 'g' : '');
  }
}

const BUTTER_ICON = '🧈';
const EGG_ICON = '🥚';
const LIGHTNING_ICON = '⚡';
const BREAD_ICON = '🍞';

const columns: Column<Food>[] = [
  {
    id: 'category',
    accessor: 'category',
    Header: 'C',

  },
  {
    id: 'name',
    accessor: 'name',
    Header: 'Name',
  },
  {
    id: 'reference',
    accessor: (food: Food) => food.refAmount,
    Header: 'ref?',
    Cell: (c: CellProps<Food, number>) => c.value + c.row.original.refUnit,
  },
  {
    id: 'energy',
    accessor: 'energy',
    Header: LIGHTNING_ICON,
    Cell: (c: CellProps<Food, number>) => formatNutrient(c.value, 'energy'),
  },
  {
    id: 'carbohydrates',
    accessor: 'carbohydrates',
    Header: BREAD_ICON,
    Cell: (c: CellProps<Food, number>) => formatNutrient(c.value, 'carbohydrates'),
  },
  {
    id: 'protein',
    accessor: 'protein',
    Header: EGG_ICON,
    Cell: (c: CellProps<Food, number>) => formatNutrient(c.value, 'protein'),
  },
  {
    id: 'fat',
    accessor: 'fat',
    Header: BUTTER_ICON,
    Cell: (c: CellProps<Food, number>) => formatNutrient(c.value, 'fat'),
  },
  {
    id: 'actions',
    Cell: (c: ActionCellProps<Food>) => FoodListActions({ ...c, record: c.row.original })
  }
];

function FoodList(props: FoodListTableProps) {
  const {
    onAddAmountHovered, 
    onAddPortionClicked, 
    onAddUnitClicked,
    data
  } = props;

  const tableInstance = useTable({
    columns,
    data: data,
    onAddAmountHovered, 
    onAddPortionClicked, 
    onAddUnitClicked,
  } as TableOptions<Food>);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = tableInstance;

  const Row = useCallback(
    ({ index, style }) => {
      const row = rows[index];
      prepareRow(row);
      return (
        <div 
          {...row.getRowProps({ style })} 
          className={cx('DataTable-row', 'FoodList-row', { odd: index % 2 === 0 })}
        >
          {row.cells.map(cell => (
            // TODO display actual values as tooltip
            <div {...cell.getCellProps()}>
              {cell.render('Cell')}
            </div>
          ))}
        </div>
      )
    }, 
    [prepareRow, rows]
  );

  return (
    <div className='DataTable-responsiveWrapper FoodList-table'>
      <div className='DataTable-wrapper'>
        <div {...getTableProps()} className='DataTable'>
          {headerGroups.map(group => (
            <div  {...group.getHeaderGroupProps()} className='DataTable-header FoodList-header'>
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
          <div {...getTableBodyProps()} className='FoodList-body'>
            <AutoSizer>
              {({height, width}) => (
                <FixedSizeList
                  height={height}
                  width={width}
                  itemCount={rows.length}
                  itemSize={34}
                >
                  {Row}
                </FixedSizeList>
              )}
            </AutoSizer>
          </div>
        </div>
      </div>
    </div>
  )
}

function compareProps(prev: Readonly<FoodListTableProps>, next: Readonly<FoodListTableProps>) {
  return prev.data === next.data;
}

export default React.memo(FoodList, compareProps);
export { formatNutrient };