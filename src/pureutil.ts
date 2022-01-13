/**
 * Return a copy of the original array, with `el` inserted at the `idx` position. 
 * If `idx` is negative or omitted, `el` will be inserted at the end.
 * 
 * @param arr The original array.
 * @param el  The element to insert.
 * @param idx The position to insert at.
 * @returns A new array, with the element inserted.
 */
function pureInsert<T>(arr: T[], el: T, idx: number = -1) {
  return idx < 0
    ? [...arr, el]
    : [...arr.slice(0, idx), el, ...arr.slice(idx + 1)];
}

/**
 * Return a copy of the original array, with the element at the `idx` position 
 * deleted. If `idx` is negative, returns a copy of the original array.
 * 
 * @param arr The original array.
 * @param idx The position to delete.
 * @returns A new array, with the specified element deleted.
 */
function pureDelete<T>(arr: T[], idx: number) {
  return idx < 0
    ? [...arr]
    : [...arr.slice(0, idx), ...arr.slice(idx + 1)];
}

export { 
  pureInsert,
  pureDelete
};