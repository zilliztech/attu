import {
  CreateDatabaseRequest,
  ListDatabasesRequest,
  DropDatabasesRequest,
  ListDatabasesResponse,
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

  async listDatabase(
    clientId: string,
    data?: ListDatabasesRequest
  ): Promise<ListDatabasesResponse> {
    const { milvusClient, database } = clientCache.get(clientId);

    const res = await milvusClient.listDatabases(data);

    // test if the user has permission to access the database, loop through all databases
    // and check if the user has permission to access the database
    const availableDatabases: string[] = [];

    for (const db of res.db_names) {
      try {
        await milvusClient.use({ db_name: db });
        await milvusClient.listDatabases(data);
        availableDatabases.push(db);
      } catch (e) {
        // ignore
      }
    }

    // recover current database
    await milvusClient.use({ db_name: database });

    throwErrorFromSDK(res.status);
    return { ...res, db_names: availableDatabases };
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
