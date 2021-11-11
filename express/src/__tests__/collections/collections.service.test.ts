

import mockMilvusClient from '../../__mocks__/milvus/milvusClient';
import { CollectionsService } from '../../collections/collections.service';
import { MilvusService } from '../../milvus/milvus.service';
import { ERR_NO_COLLECTION, ERR_NO_PARAM, mockAddress } from '../utils/constants';


// mock Milvus client
jest.mock('@zilliz/milvus2-sdk-node', () => {
  return {
    MilvusClient: mockMilvusClient,
  };
});

describe('Test collections service', () => {
  let milvusService: any;
  let service: any;

  beforeEach(async () => {
    // setup Milvus service and connect to mock Milvus client
    milvusService = new MilvusService();
    await milvusService.connectMilvus(mockAddress);
    service = new CollectionsService(milvusService);
  });

  afterEach(() => {
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

    try {
      await service.getCollections();
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
    expect(res.data).toBe('c1');

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
    
  })
});
