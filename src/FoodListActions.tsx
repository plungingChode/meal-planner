import type { FoodRecord } from './models';

import React from 'react'

interface FoodListActionsProps {
  record: FoodRecord;
  onAddAmountHovered?: (hovered: boolean) => void;
  onAddPortionClicked?: (record: FoodRecord) => void;
  onAddUnitClicked?: () => void;
}

function FoodListActions(props: FoodListActionsProps) {
  const {
    record,
    onAddAmountHovered,
    onAddPortionClicked
  } = props;

  const onMouseEnter = () => onAddAmountHovered && onAddAmountHovered(true);
  const onMouseLeave = () => onAddAmountHovered && onAddAmountHovered(false);
  const onAddPortion = () => onAddPortionClicked && onAddPortionClicked(record);

  return (
    <>
      <button 
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onAddPortion}
      >
        +A
      </button>
      <button
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >+1</button>
    </>
  )
}

export default FoodListActions;