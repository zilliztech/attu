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
