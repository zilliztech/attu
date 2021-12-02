import mockMilvusClient from '../__mocks__/milvus/milvusClient';
import { MilvusService } from '../../milvus/milvus.service';
import { mockAddress } from '../__mocks__/consts';

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
  });

  afterEach(() => {
    service = null;
  });

  test('test connectMilvus method', async () => {
    expect(service.milvusClientGetter).toBeUndefined();
    expect(service.milvusAddressGetter).toBe('');

    const res = await service.connectMilvus(mockAddress);
    expect(res.address).toBe(mockAddress);
    expect(service.milvusAddressGetter).toBe(mockAddress);
    expect(service.milvusClientGetter).toBeDefined();
  });

  test('test connectMilvus method error', async () => {
    try {
      await service.connectMilvus('');
    } catch (err) {
      expect(err.message).toBe(
        'Connect milvus failed, check your milvus address.'
      );
    }
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
    await service.connectMilvus(mockAddress);
    // different address
    const errorRes = await service.checkConnect('123');
    expect(errorRes.connected).toBeFalsy();
    const res = await service.checkConnect(mockAddress);
    expect(res.connected).toBeTruthy();
  });

  test('test managers after connected', async () => {
    await service.connectMilvus(mockAddress);
    expect(service.collectionManager).toBeDefined();
    expect(service.partitionManager).toBeDefined();
    expect(service.indexManager).toBeDefined();
    expect(service.dataManager).toBeDefined();
  });

  test('test flush method', async () => {
    await service.connectMilvus(mockAddress);
    const res = await service.flush({ collection_names: ['c1', 'c2'] });
    const data = res.data.collection_names;
    expect(data.length).toBe(2);
  });

  test('test getMetrics method', async () => {
    await service.connectMilvus(mockAddress);
    const res = await service.getMetrics();
    expect(res.type).toBe('system_info');
  });
});
