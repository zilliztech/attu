import { generateId } from './Common';

/**
 * function to convert uploaded csv to MilvusGrid component accepted data type
 * @param data uploaded csv data, e.g. [['name1', 12], ['name2', 14]]
 * @returns key value pair object array, use index as key, e.g. [{0: 'name1', 1: 12}, {0: 'name2', 1: 14}]
 */
export const transferCsvArrayToTableData = (data: any[][]) => {
  return data.reduce(
    (result, arr) => [...result, { ...arr, id: generateId() }],
    []
  );
};

const replaceKeysByIndex = (obj: any, newKeys: string[]) => {
  const keyValues = Object.keys(obj).map(key => {
    const newKey = newKeys[Number(key)] || key;
    return { [newKey]: parseValue(obj[key]) };
  });
  return Object.assign({}, ...keyValues);
};

const parseValue = (value: string) => {
  try {
    return JSON.parse(value);
  } catch (err) {
    return value;
  }
};

/**
 *
 * @param heads table heads, e.g. ['field1', 'field2', 'field3']
 * @param data table data, e.g. [[23, [2,3,34,4,5,56], [1,1,1,1,1,1,1,1,1,1,1]]]
 * @returns key value pair object array, with user selected heads or csv heads
 */
export const combineHeadsAndData = (heads: string[], data: any[]) => {
  // use index as key, flatten two-dimensional array
  // filter useless row
  const flatTableData = data
    .filter(d => d.some((item: string) => item !== ''))
    .reduce((result, arr) => [...result, { ...arr }], []);
  // replace flatTableData key with real head rely on index
  return flatTableData.map((d: any) => replaceKeysByIndex(d, heads));
};
