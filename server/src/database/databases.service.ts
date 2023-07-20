import { MilvusService } from '../milvus/milvus.service';
import {
  CreateDatabaseRequest,
  ListDatabasesRequest,
  DropDatabasesRequest,
} from '@zilliz/milvus2-sdk-node';
import { throwErrorFromSDK } from '../utils/Error';

export class DatabasesService {
  constructor(private milvusService: MilvusService) {}

  async createDatabase(data?: CreateDatabaseRequest) {
    const res = await this.milvusService.client.createDatabase(data);
    throwErrorFromSDK(res);
    return res;
  }

  async listDatabase(data?: ListDatabasesRequest) {
    const res = await this.milvusService.client.listDatabases(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async dropDatabase(data?: DropDatabasesRequest) {
    const res = await this.milvusService.client.listDatabases(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async use(db_name: string) {
    return await await MilvusService.activeMilvusClient.use({ db_name });
  }
}
