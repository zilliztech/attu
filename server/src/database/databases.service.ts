import { MilvusService } from '../milvus/milvus.service';
import {
  CreateDatabaseRequest,
  ListDatabasesRequest,
  DropDatabasesRequest,
} from '@zilliz/milvus2-sdk-node';
import { throwErrorFromSDK } from '../utils/Error';
import { clientCache } from '../app';

export class DatabasesService {
  async createDatabase(clientId: string, data: CreateDatabaseRequest) {
        const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.createDatabase(data);
    throwErrorFromSDK(res);
    return res;
  }

  async listDatabase(clientId: string, data?: ListDatabasesRequest) {
        const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.listDatabases(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async dropDatabase(clientId: string, data: DropDatabasesRequest) {
        const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.dropDatabase(data);
    throwErrorFromSDK(res);
    return res;
  }

  async use(clientId: string, db_name: string) {
        const { milvusClient } = clientCache.get(clientId);

    return await await milvusClient.use({ db_name });
  }

  async hasDatabase(clientId: string, data: string) {
    const { db_names } = await this.listDatabase(clientId);
    return db_names.indexOf(data) !== -1;
  }
}
