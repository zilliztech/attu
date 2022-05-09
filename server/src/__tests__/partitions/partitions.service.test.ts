import mockMilvusClient from '../__mocks__/milvus/milvusClient';
import { MilvusService } from '../../milvus/milvus.service';
import { ERR_NO_COLLECTION } from '../utils/constants';
import { PartitionsService } from '../../partitions/partitions.service';
import {
  insightCacheForTest,
  mockAddress,
  mockGetPartitionsInfoData,
  mockPartition,
} from '../__mocks__/consts';
import { MilvusClient } from '@zilliz/milvus2-sdk-node/dist/milvus';

// mock Milvus client
jest.mock('@zilliz/milvus2-sdk-node', () => {
  return {
    MilvusClient: mockMilvusClient,
  };
});

describe('Test partitions service', () => {
  let milvusService: any;
  let service: any;

  beforeAll(async () => {
    // setup Milvus service and connect to mock Milvus client
    milvusService = new MilvusService();
    MilvusService.activeAddress = mockAddress;
    MilvusService.activeMilvusClient = new MilvusClient(mockAddress);

    await milvusService.connectMilvus(
      { address: mockAddress },
      insightCacheForTest
    );
    service = new PartitionsService(milvusService);
  });

  afterAll(() => {
    milvusService = null;
    service = null;
  });

  test('test manager after connected to Milvus', () => {
    expect(service.partitionManager).toBeDefined();
  });

  test('test createPartition method', async () => {
    const res = await service.createPartition({
      collection_name: 'c1',
      partition_name: 'p1',
    });
    expect(res.data).toBe('p1');

    try {
      await service.createPartition({
        collection_name: '',
        partition_name: 'p1',
      });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });

  test('test deletePartition method', async () => {
    const mockParam = {
      collection_name: 'c1',
      partition_name: 'p1',
    };
    const res = await service.deletePartition(mockParam);
    expect(res.data).toEqual(mockParam);

    try {
      await service.deletePartition({
        collection_name: '',
        partition_name: '',
      });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });

  test('test loadPartitions method', async () => {
    const mockParam = {
      collection_name: 'c1',
      partition_names: ['p1', 'p2'],
    };
    const res = await service.loadPartitions(mockParam);
    expect(res.data).toEqual(mockParam);

    try {
      await service.loadPartitions({
        collection_name: '',
        partition_names: [],
      });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });

  test('test releasePartitions method', async () => {
    const mockParam = {
      collection_name: 'c1',
      partition_names: ['p1', 'p2'],
    };
    const res = await service.releasePartitions(mockParam);
    expect(res.data).toEqual(mockParam);

    try {
      await service.releasePartitions({
        collection_name: '',
        partition_names: [],
      });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });

  test('test getPartitions method', async () => {
    const res = await service.getPartitions({ collection_name: 'c1' });
    const { status, ...data } = res;
    expect(data).toEqual(mockPartition);

    try {
      await service.getPartitions({ collection_name: '' });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });

  test('test getPartitionStatistics method', async () => {
    const res = await service.getPartitionStatistics({
      collection_name: 'c1',
      partition_name: 'p1',
    });
    const { status, ...data } = res;
    expect(data.name).toBe('p1');
    expect(data.stats.length).toBe(1);

    try {
      await service.getPartitionStatistics({
        collection_name: '',
        partition_name: '',
      });
    } catch (err) {
      expect(err).toBe(ERR_NO_COLLECTION);
    }
  });

  test('test getPartitionsInfo method', async () => {
    const res = await service.getPartitionsInfo({ collection_name: 'c1' });
    expect(res).toEqual(mockGetPartitionsInfoData);
  });
});
