import {
  KeyValuePair,
  FieldSchema,
  convertToDataType,
  FieldType,
} from '@zilliz/milvus2-sdk-node';

export const findKeyValue = (obj: KeyValuePair[], key: string) =>
  obj.find(v => v.key === key)?.value;

const MAX_INT8 = 127;
const MAX_INT16 = 32767;
const MAX_INT32 = 214748364;
const MAX_INT64 = 214748364;
const CHARACTERS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const CHARACTERS_LENGTH = CHARACTERS.length;
const MAX_KEYS = 10;

export const makeRandomId = (length: number): string =>
  Array.from({ length })
    .map(() => CHARACTERS.charAt(makeRandomInt(CHARACTERS_LENGTH)))
    .join('');

export const makeDynamicBool = () => Math.random() > 0.5;
export const makeRandomInt = (max: number, allowNegative: boolean = true) => {
  const value = Math.floor(Math.random() * max);
  return allowNegative && Math.random() < 0.5 ? -value : value;
};
export const makeFloat = (allowNegative: boolean = true) => {
  const value = Math.random();
  return allowNegative && Math.random() < 0.5 ? -value : value;
};

export const makeRandomSparse = (dim: number) => {
  const nonZeroCount = Math.floor(Math.random() * dim!) || 4;
  const sparseObject: { [key: number]: number } = {};
  for (let i = 0; i < nonZeroCount; i++) {
    sparseObject[Math.floor(Math.random() * dim!)] = Math.random();
  }
  return sparseObject;
};

export const makeRandomVarChar = (maxLength: number) => {
  const words = [
    'quick',
    'brown',
    'fox',
    'jumps',
    'over',
    'lazy',
    'dog',
    'runs',
    'forest',
    'grace',
    'speed',
    'bright',
    'sky',
    'beautiful',
    'day',
    'adventure',
    'beyond',
    'horizon',
    'silent',
  ];

  let text = '';
  const space = ' ';

  while (text.length < maxLength) {
    // Pick a random word from the list
    const nextWord = words[Math.floor(Math.random() * words.length)];
    const newLength = text.length + nextWord.length + (text ? space.length : 0);

    if (newLength <= maxLength) {
      text += (text ? space : '') + nextWord;
    } else {
      break; // Stop adding words when the limit is reached
    }
  }

  return text;
};

export const genDataByType = (field: FieldSchema): any => {
  const { data_type, type_params, element_type } = field;
  switch (data_type) {
    case 'Bool':
      return makeDynamicBool();
    case 'Int8':
      return makeRandomInt(MAX_INT8);
    case 'Int16':
      return makeRandomInt(MAX_INT16);
    case 'Int32':
      return makeRandomInt(MAX_INT32);
    case 'Int64':
      return makeRandomInt(MAX_INT64);
    case 'Float':
    case 'Double':
      return makeFloat();
    case 'FloatVector':
    case 'Float16Vector':
    case 'BFloat16Vector':
    case 'BinaryVector':
      return Array.from({
        length:
          Number(type_params[0].value) / (data_type === 'BinaryVector' ? 8 : 1),
      }).map(makeFloat);
    case 'SparseFloatVector':
      return makeRandomSparse(16);
    case 'VarChar':
      const len = Number(findKeyValue(type_params, 'max_length'));
      return makeRandomVarChar(len) || makeRandomId(len);
    case 'JSON':
      return makeRandomJSON();
    case 'Array':
      return Array.from({
        length: Number(findKeyValue(type_params, 'max_capacity')),
      }).map(() => genDataByType({ ...field, data_type: element_type }));
  }
};

export const makeRandomJSON = () => {
  const obj: any = {};
  const numKeys = makeRandomInt(MAX_KEYS) + 1;
  for (let i = 0; i < numKeys; i++) {
    const key = `key${i}`;
    const value = Math.random() < 0.5 ? makeRandomInt(100) : `value${i}`;
    obj[key] = value;
  }

  const arrayKey = 'containsKey';
  const arrayLength = makeRandomInt(MAX_KEYS) + 1;
  obj[arrayKey] = Array.from({ length: arrayLength }, () => makeRandomInt(100));

  return obj;
};

export const genRow = (
  fields: FieldSchema[],
  enableDynamicField: boolean = false
) => {
  const result: any = {};
  fields.forEach(field => {
    if (!field.autoID) {
      result[field.name] = genDataByType(field);
    }
  });

  if (enableDynamicField) {
    result.dynamicBool = makeDynamicBool();
    result.dynamicInt = makeRandomInt(MAX_INT8);
    result.dynamicJSON = makeRandomJSON();
  }
  return result;
};

export const genRows = (
  fields: FieldSchema[],
  size: number,
  enableDynamicField: boolean = false
) => Array.from({ length: size }, () => genRow(fields, enableDynamicField));

export const convertFieldSchemaToFieldType = (fieldSchema: FieldSchema) => {
  const fieldType: FieldType = {
    name: fieldSchema.name,
    description: fieldSchema.description,
    data_type: convertToDataType(fieldSchema.data_type),
    element_type: convertToDataType(fieldSchema.element_type),
    is_primary_key: fieldSchema.is_primary_key,
    is_partition_key: fieldSchema.is_partition_key,
    autoID: fieldSchema.autoID,
  };

  // Convert type_params from array to object
  if (fieldSchema.type_params) {
    fieldType.type_params = {};
    for (const param of fieldSchema.type_params) {
      fieldType.type_params[param.key] = param.value;
    }
  }

  return fieldType;
};

/**
 *
 * @param obj e.g. {name: 'test'}
 * @returns key value pair, e.g. [{key: 'name', value: 'test'}]
 */
export const getKeyValuePairFromObj = (obj: {
  [key in string]: any;
}): KeyValuePair[] => {
  const pairs: { key: string; value: string }[] = Object.entries(obj).map(
    ([key, value]) => ({
      key,
      value: value as string,
    })
  );
  return pairs;
};

export const getKeyValueListFromJsonString = (json: string): KeyValuePair[] => {
  try {
    const obj = JSON.parse(json);
    const pairs = getKeyValuePairFromObj(obj);

    return pairs;
  } catch (err) {
    throw err;
  }
};

export const cloneObj = (obj: any) => JSON.parse(JSON.stringify(obj));

export const isElectron = () => {
  return process.versions && !!process.versions.electron;
};
