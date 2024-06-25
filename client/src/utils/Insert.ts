import { FieldObject } from '@server/types';
import { generateId } from './Common';
import { DataTypeEnum } from '@/consts'

/**
 * function to convert uploaded csv to AttuGrid component accepted data type
 * @param data uploaded csv data, e.g. [['name1', 12], ['name2', 14]]
 * @returns key value pair object array, use index as key, e.g. [{0: 'name1', 1: 12}, {0: 'name2', 1: 14}]
 */
export const transferCsvArrayToTableData = (data: any[][]) => {
  return data.reduce(
    (result, arr) => [...result, { ...arr, id: generateId() }],
    []
  );
};

/**
 * function to replace object key
 * @param obj e.g. {0: 'name1', 1: 12, 2: 'red'}
 * @param newKeys e.g. ['name', 'age', 'color']
 * @returns e.g. {name: 'name1', age: 12, color: 'red'}
 */
const replaceKeysByIndex = (
  obj: any,
  newKeys: string[],
  fields: FieldObject[]
) => {
  const keyValues = Object.keys(obj).map(key => {
    const newKey = newKeys[Number(key)] || key;
    const field = fields.find(f => f.name === newKey);
    const isVarChar = field && field.dataType === DataTypeEnum.VarChar as any;

    return { [newKey]: isVarChar? obj[key] : parseValue(obj[key]) };
  });
  return Object.assign({}, ...keyValues);
};

export const parseValue = (value: string) => {
  try {
    return JSON.parse(value);
  } catch (err) {
    return value;
  }
};

export const formatValue = (value: any) => {
  if (Array.isArray(value) && value.length > 0) {
    return `[${value}]`;
  }

  if (typeof value === 'object' && value && !Array.isArray(value)) {
    return JSON.stringify(value);
  }

  return value;
};

/**
 *
 * @param heads table heads, e.g. ['field1', 'field2', 'field3']
 * @param data table data, e.g. [[23, [2,3,34,4,5,56], [1,1,1,1,1,1,1,1,1,1,1]]]
 * @returns key value pair object array, with user selected heads or csv heads
 */
export const combineHeadsAndData = (
  heads: string[],
  data: any[],
  fields: FieldObject[]
) => {
  // use index as key, flatten two-dimensional array
  // filter useless row
  const flatTableData = data
    .filter(d => d.some((item: string) => item !== ''))
    .reduce((result, arr) => [...result, { ...arr }], []);
  // replace flatTableData key with real head rely on index
  return flatTableData.map((d: any) => replaceKeysByIndex(d, heads, fields));
};
