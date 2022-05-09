import mockMilvusClient from '../__mocks__/milvus/milvusClient';
import { MilvusService } from '../../milvus/milvus.service';
import { insightCacheForTest, mockAddress } from '../__mocks__/consts';
import { MilvusClient } from '@zilliz/milvus2-sdk-node/dist/milvus';

// mock Milvus client
jest.mock('@zilliz/milvus2-sdk-node', () => {
  return {
    MilvusClient: mockMilvusClient,
  };
});

describe('Test Milvus service', () => {
  let service: any;

  // init service
  beforeEach(() => {
    service = new MilvusService();
    MilvusService.activeAddress = mockAddress;
    MilvusService.activeMilvusClient = new MilvusClient(mockAddress);
  });

  afterEach(() => {
    service = null;
  });

  test('test connectMilvus method', async () => {
    const res = await service.connectMilvus(
      { address: mockAddress },
      insightCacheForTest
    );
    expect(res.address).toBe(mockAddress);
  });

  test('test checkMilvus when not connect to Milvus', () => {
    try {
      service.checkMilvus();
    } catch (err) {
      expect(err.message).toBe('Please connect milvus first');
    }
  });

  test('test checkConnect method', async () => {
    // mock connect first
    await service.connectMilvus({ address: mockAddress }, insightCacheForTest);
    // different address
    const errorRes = await service.checkConnect('123', insightCacheForTest);
    expect(errorRes.connected).toBeFalsy();
    const res = await service.checkConnect(mockAddress, insightCacheForTest);
    expect(res.connected).toBeTruthy();
  });

  test('test managers after connected', async () => {
    await service.connectMilvus({ address: mockAddress }, insightCacheForTest);
    expect(service.collectionManager).toBeDefined();
    expect(service.partitionManager).toBeDefined();
    expect(service.indexManager).toBeDefined();
    expect(service.dataManager).toBeDefined();
  });

  test('test flush method', async () => {
    await service.connectMilvus({ address: mockAddress }, insightCacheForTest);
    const res = await service.flush({ collection_names: ['c1', 'c2'] });
    const data = res.data.collection_names;
    expect(data.length).toBe(2);
  });

  test('test getMetrics method', async () => {
    await service.connectMilvus({ address: mockAddress }, insightCacheForTest);
    const res = await service.getMetrics();
    expect(res.type).toBe('system_info');
  });
});
