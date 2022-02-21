import mockMilvusClient from '../__mocks__/milvus/milvusClient';
import { MilvusService } from '../../milvus/milvus.service';
import { CodeEnum, ERR_NO_COLLECTION } from '../utils/constants';
import { SchemaService } from '../../schema/schema.service';
import { insightCacheForTest, mockAddress } from '../__mocks__/consts';
import { MilvusClient } from '@zilliz/milvus2-sdk-node/dist/milvus';

// mock Milvus client
jest.mock('@zilliz/milvus2-sdk-node', () => {
  return {
    MilvusClient: mockMilvusClient,
  };
});

describe('Test schema service', () => {
  let milvusService: any;
  let service: any;

  beforeAll(async () => {
    // setup Milvus service and connect to mock Milvus client
    milvusService = new MilvusService();
    MilvusService.activeAddress = mockAddress;
    MilvusService.activeMilvusClient = new MilvusClient(mockAddress);

    await milvusService.connectMilvus(mockAddress, insightCacheForTest);
    service = new SchemaService(milvusService);
  });

  afterAll(() => {
    milvusService = null;
    service = null;
  });

  test('test manager after connected to Milvus', () => {
    expect(service.indexManager).toBeDefined();
  });

  test('test createIndex method', async () => {
    const mockParam = {
      collection_name: 'c1',
      field_name: 'vector_field',
      extra_params: {
        index_type: 'BIN_FLAT',
        metric_type: 'HAMMING',
        params: JSON.stringify({ nlist: 1024 }),
      },
    };
    const res = await service.createIndex(mockParam);
    expect(res.data).toEqual(mockParam);

    try {
      await service.createIndex({ ...mockParam, collection_name: '' });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });

  test('test describeIndex method', async () => {
    const res = await service.describeIndex({
      collection_name: 'c1',
      field_name: 'f1',
    });
    expect(res.data).toEqual({ collection_name: 'c1', field_name: 'f1' });

    const noExistRes = await service.describeIndex({ collection_name: 'c1' });
    expect(noExistRes.status.error_code).toBe(CodeEnum.indexNoExist);

    try {
      await service.describeIndex({ collection_name: '' });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });

  test('test dropIndex method', async () => {
    const res = await service.dropIndex({
      collection_name: 'c1',
    });
    expect(res.data).toEqual({ collection_name: 'c1' });

    try {
      await service.dropIndex({ collection_name: '' });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });

  test('test getIndexState method', async () => {
    const res = await service.getIndexState({ collection_name: 'c1' });
    const { status, ...data } = res;
    expect(data).toEqual({ collection_name: 'c1', state: 3 });

    try {
      await service.getIndexState({ collection_name: '' });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });

  test('test getIndexBuildProgress method', async () => {
    const mockParam = {
      collection_name: 'c1',
      field_name: 'f1',
      index_name: 'i1',
    };
    const res = await service.getIndexBuildProgress(mockParam);
    expect(res.data).toEqual(mockParam);

    try {
      await service.getIndexBuildProgress({
        ...mockParam,
        collection_name: '',
      });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });
});
