import { getObjFromKeyValuePair } from '../Format';
import { parseValue } from '../Insert';
import { CreateIndexCodeParam } from './Types';

// use replacer to parse extra param from JSON to original object
const replacer = (key: string, value: any) => {
  if (typeof value === 'string') {
    return parseValue(value);
  }
  return value;
};

export const getCreateIndexPYCode = (params: CreateIndexCodeParam) => {
  const { collectionName, fieldName, extraParams } = params;
  const obj = getObjFromKeyValuePair(extraParams);
  const index = {
    ...obj,
    params: parseValue(obj.params),
  };
  const pyCode = `from pymilvus_orm import Collection

collection = Collection('${collectionName}')
index = ${JSON.stringify(index, replacer, 4)}
collection.create_index(${fieldName}, index)`;

  return pyCode;
};
