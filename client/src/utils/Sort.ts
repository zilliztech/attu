type numberObj = {
  [x: string]: number;
};

export const descendingComparator = (
  a: numberObj,
  b: numberObj,
  orderBy: React.ReactText
) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
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
