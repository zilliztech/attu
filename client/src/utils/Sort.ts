import type { SortType } from '@/components/grid/Types';

type numberObj = {
  [x: string]: number;
};

type stringObj = {
  [x: string]: string;
};

export const descendingNumberComparator = (
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

export const descendingStringComparator = (
  a: stringObj,
  b: stringObj,
  orderBy: string
) => {
  const aValue = a[orderBy].toLowerCase(); // Convert to lowercase for case-insensitive comparison
  const bValue = b[orderBy].toLowerCase(); // Convert to lowercase for case-insensitive comparison

  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
};

export const getComparator = (
  order: string,
  orderBy: string,
  sortType: SortType = 'number'
) => {
  switch (sortType) {
    case 'string':
      return order === 'desc'
        ? (a: stringObj, b: stringObj) =>
            descendingStringComparator(a, b, orderBy)
        : (a: stringObj, b: stringObj) =>
            -descendingStringComparator(a, b, orderBy);
    default:
      return order === 'desc'
        ? (a: numberObj, b: numberObj) =>
            descendingNumberComparator(a, b, orderBy)
        : (a: numberObj, b: numberObj) =>
            -descendingNumberComparator(a, b, orderBy);
  }
};

export const stableSort = (
  array: any[],
  comparator: ReturnType<typeof getComparator>,
) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
};
