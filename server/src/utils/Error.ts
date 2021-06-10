import {
  ErrorCode,
  ResStatus,
} from '@zilliz/milvus-sdk-node-dev/dist/milvus/types/Response';

export const throwErrorFromSDK = (res: ResStatus) => {
  if (res.error_code !== ErrorCode.SUCCESS) {
    throw res.reason;
  }
};
