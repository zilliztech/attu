import LRUCache from 'lru-cache';
import { EXPIRED_TIME } from '../../utils/Const';

export const insightCacheForTest = new LRUCache({
  maxAge: EXPIRED_TIME,
  updateAgeOnGet: true,
});

// mock data
export const mockAddress = '127.0.0.1:19530';
export const mockCollectionNames = [{ name: 'c1' }, { name: 'c2' }];
export const mockCollections = [
  {
    name: 'c1',
    collectionID: 1,
    schema: {
      fields: [
        {
          name: 'vector_field',
          data_type: 'FloatVector',
          type_params: [
            {
              key: 'dim',
              value: '4',
            },
          ],
        },
        {
          is_primary_key: true,
          autoID: true,
          name: 'age',
          data_type: 'data_type',
          type_params: [] as any[],
        },
      ],
      description: 'mock schema description 1',
    },
    created_utc_timestamp: '123456',
  },
  {
    name: 'c2',
    collectionID: 2,
    schema: {
      fields: [
        {
          name: 'vector_field',
          data_type: 'FloatVector',
          type_params: [
            {
              key: 'dim',
              value: '4',
            },
          ],
        },
        {
          name: 'age',
          data_type: 'data_type',
          type_params: [] as any[],
        },
      ],
      description: 'mock schema description 2',
    },
    created_utc_timestamp: '1234567',
  },
];
export const mockLoadedCollections = [
  {
    id: 1,
    name: 'c1',
    loadedPercentage: '100',
  },
];
// index state is finished
export const mockIndexState = [
  { collection_name: 'c1', state: 3 },
  { collection_name: 'c2', state: 2 },
];

export const mockPartition = {
  partition_names: ['p1', 'p2'],
  partitionIDs: [1, 2],
  created_timestamps: ['12345', '12354'],
  created_utc_timestamps: ['12345', '12354'],
};

// mock results
export const mockGetAllCollectionsData = [
  {
    collection_name: 'c2',
    schema: {
      fields: [
        {
          name: 'vector_field',
          data_type: 'FloatVector',
          type_params: [
            {
              key: 'dim',
              value: '4',
            },
          ],
        },
        {
          name: 'age',
          data_type: 'data_type',
          type_params: [] as any[],
        },
      ],
      description: 'mock schema description 2',
    },
    description: 'mock schema description 2',
    autoID: undefined as boolean,
    rowCount: 7,
    id: 2,
    loadedPercentage: '-1',
    createdTime: 1234567,
    index_status: 2,
  },
  {
    collection_name: 'c1',
    schema: {
      fields: [
        {
          name: 'vector_field',
          data_type: 'FloatVector',
          type_params: [
            {
              key: 'dim',
              value: '4',
            },
          ],
        },
        {
          is_primary_key: true,
          autoID: true,
          name: 'age',
          data_type: 'data_type',
          type_params: [] as any[],
        },
      ],
      description: 'mock schema description 1',
    },
    description: 'mock schema description 1',
    autoID: true,
    rowCount: 7,
    id: 1,
    loadedPercentage: '100',
    createdTime: 123456,
    index_status: 3,
  },
];

export const mockLoadedCollectionsData = [
  {
    collection_name: 'c1',
    id: 1,
    rowCount: 7,
  },
];

export const mockGetPartitionsInfoData = [
  {
    name: 'p1',
    id: 1,
    createdTime: '12345',
    rowCount: 7,
  },
  {
    name: 'p2',
    id: 2,
    createdTime: '12354',
    rowCount: 7,
  },
];
