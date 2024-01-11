import { MilvusService } from '../milvus/milvus.service';
import {
  CreateDatabaseRequest,
  ListDatabasesRequest,
  DropDatabasesRequest,
} from '@zilliz/milvus2-sdk-node';
import { throwErrorFromSDK } from '../utils/Error';

export class DatabasesService {
  async createDatabase(data: CreateDatabaseRequest) {
    const res = await MilvusService.activeMilvusClient.createDatabase(data);
    throwErrorFromSDK(res);
    return res;
  }

  async listDatabase(data?: ListDatabasesRequest) {
    const res = await MilvusService.activeMilvusClient.listDatabases(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async dropDatabase(data: DropDatabasesRequest) {
    const res = await MilvusService.activeMilvusClient.dropDatabase(data);
    throwErrorFromSDK(res);
    return res;
  }

  async use(db_name: string) {
    return await await MilvusService.activeMilvusClient.use({ db_name });
  }

  async hasDatabase(data: string) {
    const { db_names } = await this.listDatabase();
    return db_names.indexOf(data) !== -1;
  }
}
