import { KeyValuePair } from '@zilliz/milvus2-sdk-node/dist/milvus/types/Common';

export const findKeyValue = (obj: KeyValuePair[], key: string) =>
  obj.find((v) => v.key === key)?.value;
