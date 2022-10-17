import { KeyValuePair } from '@zilliz/milvus2-sdk-node/dist/milvus/types/Common';
import { FieldSchema } from '@zilliz/milvus2-sdk-node/dist/milvus/types/Response';

export const findKeyValue = (obj: KeyValuePair[], key: string) =>
  obj.find(v => v.key === key)?.value;

export const genDataByType = ({ data_type, type_params }: FieldSchema) => {
  console.log(222222, type_params);
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
