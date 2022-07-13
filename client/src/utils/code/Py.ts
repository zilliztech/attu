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
  const { collectionName, fieldName, indexName, extraParams, isScalarField } =
    params;
  const index_params = {
    ...extraParams,
    params: parseValue(extraParams.params),
  };
  const pyCode = `from pymilvus_orm import Collection

collection = Collection('${collectionName}')
${
  isScalarField
    ? ''
    : `index_params = ${JSON.stringify(index_params, replacer, 4)}`
}

collection.create_index(
  field_name="${fieldName}",
  ${isScalarField ? '' : `index_params=index_params,`}
  index_name="${indexName}"
)`;

  return pyCode;
};
