import { FlushReq } from '@zilliz/milvus2-sdk-node/dist/milvus/types';

const mockMilvusClient = jest.fn().mockImplementation((address: string) => {
  return {
    collectionManager: {
      hasCollection: (param: { collection_name: string }) => {
        const { collection_name } = param;
        if (address === '') {
          throw new Error('no address');
        }
        return collection_name;
      },
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
