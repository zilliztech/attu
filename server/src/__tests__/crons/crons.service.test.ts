import mockMilvusClient from '../__mocks__/milvus/milvusClient';
import { schedule } from 'node-cron';
import { CollectionsService } from '../../collections/collections.service';
import { CronsService, SchedulerRegistry } from '../../crons/crons.service';
import { MilvusService } from '../../milvus/milvus.service';
import { WS_EVENTS, WS_EVENTS_TYPE } from '../../utils/Const';
import { insightCacheForTest, mockAddress } from '../__mocks__/consts';
import { MilvusClient } from '@zilliz/milvus2-sdk-node/dist/milvus';

// mock Milvus client
jest.mock('@zilliz/milvus2-sdk-node', () => {
  return {
    MilvusClient: mockMilvusClient,
  };
});

// mock node-cron
jest.mock('node-cron', () => {
  return {
    schedule: jest.fn(),
  };
});

// mock variable
const mockCronFrequency = '30 00 * * *';
const mockCronEveryFiveSec = '*/5 * * * * *';
const mockCb = jest.fn();
const mockErrCb = jest.fn(() => {
  throw new Error('error');
});
const mockName = 'j1';
const mockSecName = 'everySec';

describe('test crons service', () => {
  let milvusService: any;
  let collectionService: any;
  let cronsService: any;
  let schedulerRegistry: any;

  const handleStartTask = jest.fn();
  const handleEndTask = jest.fn();

  const setup = async () => {
    milvusService = new MilvusService();
    MilvusService.activeAddress = mockAddress;
    MilvusService.activeMilvusClient = new MilvusClient(mockAddress);

    await milvusService.connectMilvus(
      { address: mockAddress },
      insightCacheForTest
    );

    collectionService = new CollectionsService(milvusService);

    schedulerRegistry = new SchedulerRegistry([]);
    cronsService = new CronsService(collectionService, schedulerRegistry);
  };

  beforeAll(async () => {
    // setup Milvus service and connect to mock Milvus client
    await setup();
  });

  beforeEach(() => {
    // mock schedule
    (schedule as jest.Mock).mockImplementationOnce((frequency, callback) => {
      callback();
      return {
        start: handleStartTask,
        stop: handleEndTask,
      };
    });
  });

  afterAll(() => {
    milvusService = null;
    collectionService = null;
    schedulerRegistry = null;
    cronsService = null;
  });

  test('test SchedulerRegistry related methods', async () => {
    schedulerRegistry.setCronJob(mockName, mockCronFrequency, () => mockCb());
    expect(mockCb).toBeCalledTimes(1);
    expect(schedule).toBeCalledWith(mockCronFrequency, expect.any(Function));

    const job = schedulerRegistry.getCronJob(mockName);
    expect(job).toEqual({
      start: handleStartTask,
      stop: handleEndTask,
    });

    schedulerRegistry.setCronJob(mockName, mockCronFrequency, () => mockCb());
    expect(handleEndTask).toBeCalled();

    schedulerRegistry.setCronJobEveryFiveSecond(mockSecName, () => mockCb());
    expect(schedule).toBeCalledWith(mockCronEveryFiveSec, expect.any(Function));

    schedulerRegistry.setCronJob(mockName, mockCronFrequency, () => mockCb());
    expect(handleEndTask).toBeCalled();

    schedulerRegistry.setCronJob(mockName, mockCronFrequency, () =>
      mockErrCb()
    );
    expect(() => {
      mockErrCb();
    }).toThrow();
  });

  test('test CronService related methods', async () => {
    try {
      await cronsService.toggleCronJobByName({
        name: WS_EVENTS.COLLECTION,
        type: WS_EVENTS_TYPE.STOP,
      });
    } catch (err) {
      expect(err.message).toBe('No existed job entity');
    }

    await cronsService.toggleCronJobByName({
      name: WS_EVENTS.COLLECTION,
      type: WS_EVENTS_TYPE.START,
    });
    expect(schedule).toBeCalledWith(mockCronEveryFiveSec, expect.any(Function));

    schedulerRegistry.setCronJob(WS_EVENTS.COLLECTION, mockCronFrequency, () =>
      mockCb()
    );
    await cronsService.toggleCronJobByName({
      name: WS_EVENTS.COLLECTION,
      type: WS_EVENTS_TYPE.START,
    });

    expect(handleStartTask).toBeCalled();
    await cronsService.toggleCronJobByName({
      name: WS_EVENTS.COLLECTION,
      type: WS_EVENTS_TYPE.STOP,
    });
    expect(handleStartTask).toBeCalled();

    try {
      await cronsService.toggleCronJobByName({
        name: mockName,
        type: WS_EVENTS_TYPE.STOP,
      });
    } catch (err) {
      expect(err.message).toBe('Unsupported event type');
    }
  });

  test('test getCollections error', async () => {
    // reset setup to trigger error
    const newCollectionService = new CollectionsService(milvusService);
    const newSchedulerRegistry = new SchedulerRegistry([]);

    const newCronsService = new CronsService(
      newCollectionService,
      newSchedulerRegistry
    );

    await newCronsService.getCollections(
      WS_EVENTS.COLLECTION,
      '127.0.0.1:19530'
    );
    expect(schedule).toBeCalledWith(mockCronEveryFiveSec, expect.any(Function));
    expect(handleEndTask).toBeCalled();
  });
});
