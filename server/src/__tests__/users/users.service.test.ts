import mockMilvusClient from '../__mocks__/milvus/milvusClient';
import { MilvusService } from '../../milvus/milvus.service';
import { CodeEnum } from '../utils/constants';
import { insightCacheForTest, mockAddress } from '../__mocks__/consts';
import { MilvusClient } from '@zilliz/milvus2-sdk-node/dist/milvus';
import { UserService } from '../../users/users.service';

// mock Milvus client
jest.mock('@zilliz/milvus2-sdk-node', () => {
  return {
    MilvusClient: mockMilvusClient,
  };
});

describe('Test user service', () => {
  let milvusService: any;
  let service: UserService;

  beforeAll(async () => {
    // setup Milvus service and connect to mock Milvus client
    milvusService = new MilvusService();
    MilvusService.activeAddress = mockAddress;
    MilvusService.activeMilvusClient = new MilvusClient(mockAddress);

    await milvusService.connectMilvus(
      { address: mockAddress },
      insightCacheForTest
    );
    service = new UserService(milvusService);
  });

  afterAll(() => {
    milvusService = null;
    service = null;
  });

  test('test user manager after connected to Milvus', () => {
    expect(service.userManager).toBeDefined();
  });

  test('test getUsers method', async () => {
    const res = await service.getUsers();
    expect(res.usernames.length).toEqual(1);
  });

  test('test create user method', async () => {
    const res = await service.createUser({ username: '1', password: '2' });
    expect(res.error_code).toEqual(CodeEnum.success);
  });

  test('test delete user method', async () => {
    const res = await service.deleteUser({ username: '1' });
    expect(res.error_code).toEqual(CodeEnum.success);
  });

  test('test update user method', async () => {
    const res = await service.updateUser({
      username: '1',
      oldPassword: '1',
      newPassword: '2',
    });
    expect(res.error_code).toEqual(CodeEnum.success);
  });
});
