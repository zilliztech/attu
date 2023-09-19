import {
  KeyValuePair,
  FieldSchema,
} from '@zilliz/milvus2-sdk-node/dist/milvus/types';

export const findKeyValue = (obj: KeyValuePair[], key: string) =>
  obj.find(v => v.key === key)?.value;

export const makeDynamicBool = () => Math.random() > 0.5;
export const makeRandomInt = () => Math.floor(Math.random() * 127);

export const genDataByType = ({ data_type, type_params }: FieldSchema) => {
  switch (data_type) {
    case 'Bool':
      return makeDynamicBool();
    case 'Int8':
      return makeRandomInt();
    case 'Int16':
      return Math.floor(Math.random() * 32767);
    case 'Int32':
      return Math.floor(Math.random() * 214748364);
    case 'Int64':
      return Math.floor(Math.random() * 214748364);
    case 'FloatVector':
      return Array.from({ length: (type_params as any)[0].value }).map(() =>
        Math.random()
      );
    case 'BinaryVector':
      return Array.from({ length: (type_params as any)[0].value / 8 }).map(
        () => (Math.random() > 0.5 ? 1 : 0)
      );
    case 'VarChar':
      return makeRandomId((type_params as any)[0].value);
    case 'JSON':
      return makeRandomJSON();
  }
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
    result.dynamicInt = makeRandomInt();
    result.dynamicJSON = makeRandomJSON();
  }
  return result;
};

export const genRows = (
  fields: FieldSchema[],
  size: number,
  enableDynamicField: boolean = false
) => {
  const result = [];
  for (let i = 0; i < size; i++) {
    result[i] = genRow(fields, enableDynamicField);
  }
  return result;
};

export const makeRandomId = (length: number): string => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const makeRandomJSON = () => {
  const obj: any = {};
  const numKeys = Math.floor(Math.random() * 10) + 1; // generate a random number of keys between 1 and 10
  for (let i = 0; i < numKeys; i++) {
    const key = `key${i}`;
    const value =
      Math.random() < 0.5 ? Math.floor(Math.random() * 100) : `value${i}`; // randomly choose between a number or a string value
    obj[key] = value;
  }

  const arrayKey = 'containsKey';
  const arrayLength = Math.floor(Math.random() * 10) + 1; // generate a random length for the array between 1 and 10
  const randomArray = Array.from({ length: arrayLength }, () =>
    Math.floor(Math.random() * 100)
  );
  obj[arrayKey] = randomArray;

  return obj;
};
