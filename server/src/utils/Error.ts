import { ErrorCode, ResStatus } from '@zilliz/milvus2-sdk-node';

export const throwErrorFromSDK = (res: ResStatus) => {
  if (res.error_code !== ErrorCode.SUCCESS) {
    // throw res.reason;
  }
};
