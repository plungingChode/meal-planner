import type { Food, FoodCategory } from './models';

import React, { useCallback, useEffect, useState } from 'react';
import FoodListTable from './FoodListTable';
import FoodListFilter from './FoodListFilter';

interface FoodListProps {
  data: Food[],
  categories: FoodCategory[],
  onAddAmountHovered?: (hovered: boolean) => void;
  onAddPortionClicked?: (record: Food) => void;
  onAddUnitClicked?: () => void;
}

function FoodList(props: FoodListProps) {
  const [filteredData, setFilteredData] = useState([] as Food[]);

  useEffect(
    () => {
      setFilteredData(props.data);
    },
    [props.data]
  );
  
  const handleFilterChanged = useCallback(
    (filterFn: (fs: Food) => boolean) => { 
      setFilteredData(props.data.filter(filterFn))
    },
    [props.data]
  );

  return (
    <>
      <FoodListFilter 
        data={props.data}
        categories={props.categories}
        onFilterChanged={handleFilterChanged}
      />    
      <FoodListTable
        data={filteredData}
        onAddAmountHovered={props.onAddAmountHovered}
        onAddPortionClicked={props.onAddPortionClicked}
        onAddUnitClicked={props.onAddUnitClicked}
      />
    </>
  )
}

export default FoodList;
