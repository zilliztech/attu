import {
  KeyValuePair,
  FieldSchema,
} from '@zilliz/milvus2-sdk-node/dist/milvus/types';

export const findKeyValue = (obj: KeyValuePair[], key: string) =>
  obj.find(v => v.key === key)?.value;

export const genDataByType = ({ data_type, type_params }: FieldSchema) => {
  switch (data_type) {
    case 'Bool':
      return Math.random() > 0.5;
    case 'Int8':
      return Math.floor(Math.random() * 127);
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
      return Array.from({ length: (type_params as any)[0].value / 8 }).map(() =>
        Math.random() > 0.5 ? 1 : 0
      );
    case 'VarChar':
      return makeRandomId((type_params as any)[0].value);
    case 'JSON':
      return makeRandomJSON();
  }
};

export const genRow = (fields: FieldSchema[]) => {
  const result: any = {};
  fields.forEach(field => {
    if (!field.autoID) {
      result[field.name] = genDataByType(field);
    }
  });
  return result;
};

export const genRows = (fields: FieldSchema[], size: number) => {
  const result = [];
  for (let i = 0; i < size; i++) {
    result[i] = genRow(fields);
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
  return obj;
};
