import {
  CreateCollectionReq,
  DescribeCollectionReq,
  DropCollectionReq,
  FlushReq,
  LoadCollectionReq,
  ShowCollectionsReq
} from '@zilliz/milvus2-sdk-node/dist/milvus/types';
import { CodeEnum, ERR_NO_ADDRESS, ERR_NO_COLLECTION, ERR_NO_PARAM } from '../../__tests__/utils/constants';

const mockMilvusClient = jest.fn().mockImplementation((address: string) => {
  return {
    collectionManager: {
      hasCollection: (param: { collection_name: string }) => {
        const { collection_name } = param;
        if (address === '') {
          throw new Error(ERR_NO_ADDRESS);
        }
        return collection_name;
      },
      showCollections: (param?: ShowCollectionsReq) => {
        if (!param) {
          return {
            status: {
              error_code: CodeEnum.error,
              reason: ERR_NO_PARAM,
            },
          };
        }
        const { collection_names } = param;
        return {
          status: { error_code: CodeEnum.success },
          data: collection_names,
        };
      },
      createCollection: (param: CreateCollectionReq) => {
        const { collection_name, fields } = param;
        if (!collection_name) {
          return {
            error_code: CodeEnum.error,
            reason: ERR_NO_COLLECTION,
          };
        }
        return { error_code: CodeEnum.success, data: fields };
      },
      describeCollection: (param: DescribeCollectionReq) => {
        const { collection_name } = param;
        if (!collection_name) {
          return {
            status: {
              error_code: CodeEnum.error,
              reason: ERR_NO_COLLECTION,
            },
          };
        }
        return {
          status: { error_code: CodeEnum.success },
          data: collection_name,
        };
      },
      dropCollection: (param: DropCollectionReq) => {
        const { collection_name } = param;
        if (!collection_name) {
          return {
            error_code: CodeEnum.error,
            reason: ERR_NO_COLLECTION,
          };
        }
        return { error_code: CodeEnum.success, data: collection_name };
      },
      loadCollection: (param: LoadCollectionReq) => {
        const {collection_name} = param
        if (!collection_name) {
          return {
            error_code: CodeEnum.error,
            reason: ERR_NO_COLLECTION
          }
        }
      }
    },
    partitionManager: {},
    indexManager: {},
    dataManager: {
      flush: (data: FlushReq) => ({
        data,
      }),
      getMetric: (data: { request: { metric_type: string } }) => {
        const {
          request: { metric_type: type },
        } = data;

        return {
          type,
        };
      },
    },
  };
});

export default mockMilvusClient;
