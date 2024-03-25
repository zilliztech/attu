type numberObj = {
  [x: string]: number;
};

export const descendingComparator = (
  a: numberObj,
  b: numberObj,
  orderBy: string
) => {
  // need to round the value to avoid floating point error
  const roundValue = (value: number) => Math.round(value * 1e12) / 1e12;

  const aValue = roundValue(a[orderBy]);
  const bValue = roundValue(b[orderBy]);

  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
};

export const getComparator = (order: string, orderBy: string) => {
  return order === 'desc'
    ? (a: numberObj, b: numberObj) => descendingComparator(a, b, orderBy)
    : (a: numberObj, b: numberObj) => -descendingComparator(a, b, orderBy);
};

export const stableSort = (
  array: any[],
  comparator: { (a: numberObj, b: numberObj): number }
) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
};
