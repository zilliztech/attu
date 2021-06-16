import { KeyValuePair } from '@zilliz/milvus-sdk-node-dev/dist/milvus/types/Common';

export const findKeyValue = (obj: KeyValuePair[], key: string) =>
  obj.find((v) => v.key === key)?.value;
