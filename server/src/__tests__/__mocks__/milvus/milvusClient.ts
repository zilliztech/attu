import {
  AlterAliasReq,
  CreateAliasReq,
  CreateCollectionReq,
  CreateIndexReq,
  CreatePartitionReq,
  DescribeCollectionReq,
  DescribeIndexReq,
  DropAliasReq,
  DropCollectionReq,
  DropIndexReq,
  DropPartitionReq,
  FlushReq,
  GetCollectionStatisticsReq,
  GetIndexBuildProgressReq,
  GetIndexStateReq,
  GetPartitionStatisticsReq,
  InsertReq,
  LoadCollectionReq,
  LoadPartitionsReq,
  ReleaseLoadCollectionReq,
  ReleasePartitionsReq,
  SearchReq,
  ShowCollectionsReq,
  ShowPartitionsReq,
} from '@zilliz/milvus2-sdk-node/dist/milvus/types';
import { DeleteEntitiesReq } from '@zilliz/milvus2-sdk-node/dist/milvus/types/Data';
import { CreateUserReq } from '@zilliz/milvus2-sdk-node/dist/milvus/types/User';
import { QueryDto } from '../../../collections/dto';
import {
  CodeEnum,
  ERR_NO_ADDRESS,
  ERR_NO_ALIAS,
  ERR_NO_COLLECTION,
  ERR_NO_INDEX,
  ERR_NO_PARAM,
} from '../../utils/constants';
import { mockStatusInfo } from '../../utils/mock.util';
import {
  mockCollectionNames,
  mockCollections,
  mockIndexState,
  mockLoadedCollections,
  mockPartition,
} from '../consts';

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
            status: mockStatusInfo(CodeEnum.success),
            data: mockCollectionNames,
          };
        }
        const { collection_names, type } = param;
        // loaded type
        if (type === 1) {
          return {
            status: mockStatusInfo(CodeEnum.success),
            data: mockLoadedCollections,
          };
        }
        return collection_names && collection_names.length > 0
          ? {
              status: mockStatusInfo(CodeEnum.success),
              data: collection_names,
            }
          : { status: mockStatusInfo(CodeEnum.error, ERR_NO_PARAM) };
      },
      createCollection: (param: CreateCollectionReq) => {
        const { collection_name, fields } = param;
        if (!collection_name) {
          return mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION);
        }
        return { ...mockStatusInfo(CodeEnum.success), data: fields };
      },
      describeCollection: (param: DescribeCollectionReq) => {
        const { collection_name } = param;
        if (!collection_name) {
          return {
            status: mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION),
          };
        }
        const res = mockCollections.find(c => c.name === collection_name) || {};
        return {
          status: mockStatusInfo(CodeEnum.success),
          ...res,
        };
      },
      dropCollection: (param: DropCollectionReq) => {
        const { collection_name } = param;
        if (!collection_name) {
          return mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION);
        }
        return { ...mockStatusInfo(CodeEnum.success), data: collection_name };
      },
      loadCollection: (param: LoadCollectionReq) => {
        const { collection_name } = param;
        if (!collection_name) {
          return mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION);
        }
        return { ...mockStatusInfo(CodeEnum.success), data: collection_name };
      },
      releaseCollection: (param: ReleaseLoadCollectionReq) => {
        const { collection_name } = param;
        if (!collection_name) {
          return mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION);
        }

        return { ...mockStatusInfo(CodeEnum.success), data: collection_name };
      },
      getCollectionStatistics: (param: GetCollectionStatisticsReq) => {
        const { collection_name } = param;
        if (!collection_name) {
          return { status: mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION) };
        }
        const data = {
          name: collection_name,
          stats: [{ key: 'row_count', value: 7 }],
        };
        return {
          status: mockStatusInfo(CodeEnum.success),
          ...data,
        };
      },
      createAlias: (param: CreateAliasReq) => {
        const { collection_name } = param;
        if (!collection_name) {
          return mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION);
        }

        return {
          ...mockStatusInfo(CodeEnum.success),
          data: param,
        };
      },
      alterAlias: (param: AlterAliasReq) => {
        const { collection_name } = param;
        if (!collection_name) {
          return mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION);
        }

        return {
          ...mockStatusInfo(CodeEnum.success),
          data: param,
        };
      },
      dropAlias: (param: DropAliasReq) => {
        const { alias } = param;
        if (!alias) {
          return mockStatusInfo(CodeEnum.error, ERR_NO_ALIAS);
        }

        return {
          ...mockStatusInfo(CodeEnum.success),
          data: alias,
        };
      },
    },
    partitionManager: {
      createPartition: (param: CreatePartitionReq) => {
        const { collection_name, partition_name } = param;
        if (!collection_name) {
          return mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION);
        }
        return { ...mockStatusInfo(CodeEnum.success), data: partition_name };
      },
      dropPartition: (param: DropPartitionReq) => {
        const { collection_name } = param;
        if (!collection_name) {
          return mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION);
        }
        return { ...mockStatusInfo(CodeEnum.success), data: param };
      },
      loadPartitions: (param: LoadPartitionsReq) => {
        const { collection_name } = param;
        if (!collection_name) {
          return mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION);
        }
        return { ...mockStatusInfo(CodeEnum.success), data: param };
      },
      releasePartitions: (param: ReleasePartitionsReq) => {
        const { collection_name } = param;
        if (!collection_name) {
          return mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION);
        }
        return { ...mockStatusInfo(CodeEnum.success), data: param };
      },
      showPartitions: (param: ShowPartitionsReq) => {
        const { collection_name } = param;
        if (!collection_name) {
          return { status: mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION) };
        }
        return {
          status: mockStatusInfo(CodeEnum.success),
          ...mockPartition,
        };
      },
      getPartitionStatistics: (param: GetPartitionStatisticsReq) => {
        const { collection_name, partition_name } = param;
        if (!collection_name) {
          return { status: mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION) };
        }

        const data = {
          name: partition_name,
          stats: [{ key: 'row_count', value: 7 }],
        };

        return {
          status: mockStatusInfo(CodeEnum.success),
          ...data,
        };
      },
    },
    indexManager: {
      getIndexState: (param: GetIndexStateReq) => {
        const { collection_name } = param;
        if (!collection_name) {
          return { status: mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION) };
        }
        const data =
          mockIndexState.find(i => i.collection_name === collection_name) || {};
        return {
          status: mockStatusInfo(CodeEnum.success),
          ...data,
        };
      },
      createIndex: (param: CreateIndexReq) => {
        const { collection_name } = param;
        if (!collection_name) {
          return mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION);
        }

        return {
          ...mockStatusInfo(CodeEnum.success),
          data: param,
        };
      },
      describeIndex: (param: DescribeIndexReq) => {
        const { collection_name, field_name } = param;
        if (!collection_name) {
          return { status: mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION) };
        }
        if (!field_name) {
          return {
            status: mockStatusInfo(CodeEnum.indexNoExist, ERR_NO_INDEX),
          };
        }

        return {
          status: mockStatusInfo(CodeEnum.success),
          data: param,
        };
      },
      dropIndex: (param: DropIndexReq) => {
        const { collection_name } = param;
        if (!collection_name) {
          return mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION);
        }

        return {
          ...mockStatusInfo(CodeEnum.success),
          data: param,
        };
      },
      getIndexBuildProgress: (param: GetIndexBuildProgressReq) => {
        const { collection_name } = param;
        if (!collection_name) {
          return { status: mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION) };
        }

        return {
          status: mockStatusInfo(CodeEnum.success),
          data: param,
        };
      },
    },
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
      insert: (param: InsertReq) => {
        const { collection_name } = param;
        if (!collection_name) {
          return { status: mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION) };
        }

        return {
          status: mockStatusInfo(CodeEnum.success),
          data: param,
        };
      },
      search: (param: SearchReq) => {
        const { collection_name } = param;
        if (!collection_name) {
          return { status: mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION) };
        }

        return {
          status: mockStatusInfo(CodeEnum.success),
          data: param,
        };
      },
      query: (
        param: {
          collection_name: string;
        } & QueryDto
      ) => {
        const { collection_name } = param;
        if (!collection_name) {
          return { status: mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION) };
        }

        return {
          status: mockStatusInfo(CodeEnum.success),
          data: param,
        };
      },
      deleteEntities: (param: DeleteEntitiesReq) => {
        const { collection_name } = param;
        if (!collection_name) {
          return { status: mockStatusInfo(CodeEnum.error, ERR_NO_COLLECTION) };
        }
        return {
          status: mockStatusInfo(CodeEnum.success),
          data: param,
        };
      },
    },
    userManager: {
      listUsers: () => {
        return {
          status: { ...mockStatusInfo(CodeEnum.success) },
          usernames: ['root'],
        };
      },
      createUser: () => {
        return { ...mockStatusInfo(CodeEnum.success) };
      },
      deleteUser: () => {
        return { ...mockStatusInfo(CodeEnum.success) };
      },
      updateUser: () => {
        return { ...mockStatusInfo(CodeEnum.success) };
      },
    },
  };
});

export default mockMilvusClient;
