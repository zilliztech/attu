import mockMilvusClient from '../__mocks__/milvus/milvusClient';
import { CollectionsService } from '../../collections/collections.service';
import { MilvusService } from '../../milvus/milvus.service';
import {
  ERR_NO_ALIAS,
  ERR_NO_COLLECTION,
  ERR_NO_PARAM,
} from '../utils/constants';
import {
  insightCacheForTest,
  mockAddress,
  mockCollectionNames,
  mockCollections,
  mockGetAllCollectionsData,
  mockLoadedCollections,
  mockLoadedCollectionsData,
} from '../__mocks__/consts';
import { MilvusClient } from '@zilliz/milvus2-sdk-node/dist/milvus';

// mock Milvus client
jest.mock('@zilliz/milvus2-sdk-node', () => {
  return {
    MilvusClient: mockMilvusClient,
  };
});

describe('Test collections service', () => {
  let milvusService: any;
  let service: any;

  beforeAll(async () => {
    // setup Milvus service and connect to mock Milvus client
    milvusService = new MilvusService();
    MilvusService.activeAddress = mockAddress;
    MilvusService.activeMilvusClient = new MilvusClient(mockAddress);

    await milvusService.connectMilvus(mockAddress, insightCacheForTest);
    service = new CollectionsService(milvusService);
  });

  afterAll(() => {
    milvusService = null;
    service = null;
  });

  test('test managers after connected to Milvus', () => {
    expect(service.collectionManager).toBeDefined();
    expect(service.dataManager).toBeDefined();
    expect(service.indexManager).toBeDefined();
  });

  test('test getCollections method', async () => {
    const res = await service.getCollections({
      collection_names: ['c1', 'c2'],
    });
    expect(res.data.length).toBe(2);

    const defaultRes = await service.getCollections();
    expect(defaultRes.data).toEqual(mockCollectionNames);

    const loadedRes = await service.getCollections({ type: 1 });
    expect(loadedRes.data).toEqual(mockLoadedCollections);

    try {
      await service.getCollections({ collection_names: [] });
    } catch (err) {
      expect(err).toBe(ERR_NO_PARAM);
    }
  });

  test('test createCollection method', async () => {
    const res = await service.createCollection({
      collection_name: 'c1',
      fields: [],
    });
    expect(res.data.length).toBe(0);

    try {
      await service.createCollection({ collection_name: '', fields: [] });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });

  test('test describeCollection method', async () => {
    const res = await service.describeCollection({
      collection_name: 'c1',
    });
    const { status, ...result } = res;
    const [mockRes] = mockCollections;
    expect(result).toEqual(mockRes);

    try {
      await service.describeCollection({ collection_name: '' });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });

  test('test dropCollection method', async () => {
    const res = await service.dropCollection({ collection_name: 'c1' });
    expect(res.data).toBe('c1');

    try {
      await service.dropCollection({ collection_name: '' });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });

  test('test loadCollection method', async () => {
    const res = await service.loadCollection({ collection_name: 'c1' });
    expect(res.data).toBe('c1');

    try {
      await service.loadCollection({ collection_name: '' });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });

  test('test releaseCollection method', async () => {
    const res = await service.releaseCollection({ collection_name: 'c1' });
    expect(res.data).toBe('c1');

    try {
      await service.releaseCollection({ collection_name: '' });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });

  test('test getCollectionStatistics method', async () => {
    const res = await service.getCollectionStatistics({
      collection_name: 'c1',
    });
    const { status, ...data } = res;
    expect(data.name).toBe('c1');
    expect(data.stats.length).toBe(1);

    try {
      await service.getCollectionStatistics({ collection_name: '' });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });

  test('test insert method', async () => {
    const mockParam = {
      collection_name: 'c1',
      fields_data: {
        vector_field: [1, 2, 3, 4],
        age: 7,
      },
    };
    const res = await service.insert(mockParam);
    expect(res.data).toEqual(mockParam);

    try {
      await service.insert({
        collection_name: '',
        fields_data: {
          vector_field: [1, 2, 3, 4],
        },
      });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });

  test('test vectorSearch method', async () => {
    const mockParam = {
      collection_name: 'c1',
      search_params: {
        anns_field: 'float_vector',
        topk: '10',
        metric_type: 'L2',
        params: JSON.stringify({ nprobe: 1024 }),
      },
      vectors: [[1, 2, 3, 4]],
      vector_type: 101,
    };

    const res = await service.vectorSearch(mockParam);
    expect(res.data).toEqual(mockParam);

    try {
      await service.vectorSearch({ ...mockParam, collection_name: '' });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });

  test('test createAlias method', async () => {
    const mockParam = {
      collection_name: 'c1',
      alias: 'alias',
    };

    const res = await service.createAlias(mockParam);
    expect(res.data).toEqual(mockParam);

    try {
      await service.createAlias({ collection_name: '', alias: '' });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });

  test('test alterAlias method', async () => {
    const mockParam = {
      collection_name: 'c1',
      alias: 'alias',
    };

    const res = await service.alterAlias(mockParam);
    expect(res.data).toEqual(mockParam);

    try {
      await service.alterAlias({ collection_name: '', alias: '' });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });

  test('test dropAlias method', async () => {
    const res = await service.dropAlias({ alias: 'alias' });
    expect(res.data).toBe('alias');

    try {
      await service.dropAlias({ alias: '' });
    } catch (err) {
      expect(err).toBe(ERR_NO_ALIAS);
    }
  });

  test('test query method', async () => {
    const mockParam = {
      collection_name: 'c1',
      expr: 'age > 7',
    };
    const res = await service.query(mockParam);
    expect(res.data).toEqual(mockParam);

    try {
      await service.query({ collection_name: '', expr: '' });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });

  test('test getIndexStatus method', async () => {
    const res = await service.getIndexStatus({ collection_name: 'c1' });
    const { status, ...data } = res;
    expect(data).toEqual({ collection_name: 'c1', state: 3 });
  });

  test('test getAllCollections method', async () => {
    const res = await service.getAllCollections();
    expect(res).toEqual(mockGetAllCollectionsData);
  });

  test('test getLoadedCollections method', async () => {
    const res = await service.getLoadedColletions();
    expect(res).toEqual(mockLoadedCollectionsData);
  });

  test('test getStatistics method', async () => {
    const res = await service.getStatistics();
    expect(res).toEqual({
      // 2 collections
      collectionCount: 2,
      // each collection 7 row counts
      totalData: 14,
    });
  });

  test('test getCollectionIndexStatus method', async () => {
    const res = await service.getCollectionsIndexStatus();
    expect(res).toEqual([
      {
        collection_name: 'c1',
        index_status: 3,
      },
      {
        collection_name: 'c2',
        index_status: 2,
      },
    ]);
  });

  test('test deleteEntities method', async () => {
    const mockParam = {
      collection_name: 'c1',
      expr: 'age > 7',
    };

    const res = await service.deleteEntities(mockParam);
    expect(res.data).toEqual(mockParam);

    try {
      await service.deleteEntities({ collection_name: '', expr: '' });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });
});
