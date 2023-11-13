import { KeyValuePair, FieldSchema } from '@zilliz/milvus2-sdk-node';

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
export const makeRandomInt = (max: number) => Math.floor(Math.random() * max);
export const makeFloat = () => Math.random();

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
    case 'BinaryVector':
      return Array.from({
        length:
          Number(type_params[0].value) / (data_type === 'BinaryVector' ? 8 : 1),
      }).map(makeFloat);
    case 'VarChar':
      return makeRandomId(Number(findKeyValue(type_params, 'max_length')));
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
    console.log(field.max_capacity);
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
