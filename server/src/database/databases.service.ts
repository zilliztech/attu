import {
  CreateDatabaseRequest,
  ListDatabasesRequest,
  DropDatabasesRequest,
} from '@zilliz/milvus2-sdk-node';
import { throwErrorFromSDK } from '../utils/Error';
import { clientCache } from '../app';
import { DatabaseObject } from '../types';

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
  ): Promise<DatabaseObject[]> {
    const { milvusClient, database } = clientCache.get(clientId);

    const res = await milvusClient.listDatabases(data);

    // test if the user has permission to access the database, loop through all databases
    // and check if the user has permission to access the database
    const availableDatabases: DatabaseObject[] = [];

    for (let i = 0; i < res.db_names.length; i++) {
      try {
        await milvusClient.use({ db_name: res.db_names[i] });
        await milvusClient.listDatabases(data);
        const collections = await milvusClient.showCollections();
        availableDatabases.push({
          name: res.db_names[i],
          collections: collections.data.map(c => c.name),
          createdTime: (res as any).created_timestamp[i] || -1,
        });
      } catch (e) {
        // ignore
      }
    }

    // recover current database
    await milvusClient.use({ db_name: database });

    throwErrorFromSDK(res.status);
    return availableDatabases;
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
    const dbs = await this.listDatabase(clientId);
    return dbs.map(d => d.name).indexOf(data) !== -1;
  }
}
