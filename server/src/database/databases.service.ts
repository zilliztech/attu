import {
  CreateDatabaseRequest,
  ListDatabasesRequest,
  DescribeDatabaseRequest,
  DescribeDatabaseResponse,
  DropDatabasesRequest,
  AlterDatabaseRequest,
} from '@zilliz/milvus2-sdk-node';
import { clientCache } from '../app';
import { DatabaseObject } from '../types';
import { SimpleQueue } from '../utils';

export class DatabasesService {
  async createDatabase(clientId: string, data: CreateDatabaseRequest) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.createDatabase(data);
    return res;
  }

  async describeDatabase(clientId: string, data: DescribeDatabaseRequest) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.describeDatabase(data);
    return res as DescribeDatabaseResponse;
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

        const dbName = res.db_names[i];

        let dbObject = {} as DescribeDatabaseResponse;
        try {
          dbObject = await this.describeDatabase(clientId, {
            db_name: dbName,
          });
        } catch (e) {
          // ignore
          console.warn('error', e.details);
        }

        availableDatabases.push({
          name: res.db_names[i],
          collections: collections.data.map(c => c.name),
          createdTime: (res as any).created_timestamp[i] || -1,
          ...dbObject,
        });
      } catch (e) {
        // ignore
        console.warn('error', e.details);
      }
    }

    // recover current database
    await milvusClient.use({ db_name: database });

    return availableDatabases;
  }

  async dropDatabase(clientId: string, data: DropDatabasesRequest) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.dropDatabase(data);
    return res;
  }

  async use(clientId: string, db_name: string) {
    const currentClient = clientCache.get(clientId);

    // clear collectionsQueue when switching database
    currentClient.collectionsQueue.stop();
    currentClient.collectionsQueue = new SimpleQueue<string>();

    return await await currentClient.milvusClient.use({ db_name });
  }

  async hasDatabase(clientId: string, data: string) {
    const dbs = await this.listDatabase(clientId);
    return dbs.map(d => d.name).indexOf(data) !== -1;
  }

  async alterDatabase(clientId: string, data: AlterDatabaseRequest) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.alterDatabase(data);
    return res;
  }
}
