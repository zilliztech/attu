import {
  MilvusClient,
  FlushReq,
  GetMetricsResponse,
  ClientConfig,
  CONNECT_STATUS,
} from '@zilliz/milvus2-sdk-node';
import { DEFAULT_MILVUS_PORT, SimpleQueue, HTTP_STATUS_CODE } from '../utils';
import { clientCache } from '../app';
import { AuthReq, AuthObject } from '../types';
import { cronsManager } from '../crons';
import HttpErrors from 'http-errors';

export class MilvusService {
  private DEFAULT_DATABASE = 'default';

  get sdkInfo() {
    return MilvusClient.sdkInfo;
  }

  static formatAddress(address: string) {
    // remove http prefix from address
    const ip = address.replace(/(http):\/\//, '');
    return ip.includes(':') ? ip : `${ip}:${DEFAULT_MILVUS_PORT}`;
  }

  async connectMilvus(data: AuthReq): Promise<AuthObject> {
    // Destructure the data object to get the connection details
    const {
      address,
      token,
      username,
      password,
      database,
      checkHealth,
      clientId,
    } = data;
    // Format the address to remove the http prefix
    const milvusAddress = MilvusService.formatAddress(address);

    // if client exists, return the client
    if (clientCache.has(clientId)) {
      const cache = clientCache.get(clientId);
      return {
        clientId: cache.milvusClient.clientId,
        database: cache.database,
      };
    }

    try {
      // Create a new Milvus client with the provided connection details
      const clientConfig: ClientConfig = {
        address: milvusAddress,
        token,
        username,
        password,
        logLevel: process.env.ATTU_LOG_LEVEL || 'info',
        database: database || this.DEFAULT_DATABASE,
        id: clientId,
        pool: {
          max: 10,
        },
      };

      if (process.env.ROOT_CERT_PATH) {
        clientConfig.tls = {
          rootCertPath: process.env.ROOT_CERT_PATH,
        };

        if (process.env.PRIVATE_KEY_PATH) {
          clientConfig.tls.privateKeyPath = process.env.PRIVATE_KEY_PATH;
        }

        if (process.env.CERT_CHAIN_PATH) {
          clientConfig.tls.certChainPath = process.env.CERT_CHAIN_PATH;
        }

        if (process.env.SERVER_NAME) {
          clientConfig.tls.serverName = process.env.SERVER_NAME;
        }
      }
      // create the client
      const milvusClient: MilvusClient = new MilvusClient(clientConfig);

      try {
        // Attempt to connect to the Milvus server
        await milvusClient.connectPromise;
      } catch (error) {
        // If the connection fails, clear the cache and throw an error
        clientCache.delete(milvusClient.clientId);
        throw HttpErrors(HTTP_STATUS_CODE.UNAUTHORIZED, error);
      }

      // Check the health of the Milvus server
      if (checkHealth) {
        const res = await milvusClient.checkHealth();

        // If the server is not healthy, throw an error
        if (!res.isHealthy) {
          clientCache.delete(milvusClient.clientId);
          throw new Error('Milvus is not ready yet.');
        }
      }

      // database
      const db = database || this.DEFAULT_DATABASE;

      // If the server is healthy, set the active address and add the client to the cache
      clientCache.set(milvusClient.clientId, {
        milvusClient,
        address,
        database: db,
        collectionsQueue: new SimpleQueue<string>(),
      });

      // test ListDatabases permission
      try {
        await milvusClient.use({ db_name: db });
        await milvusClient.listDatabases();
      } catch (e) {
        throw new Error(
          `You don't have permission to access the database: ${db}.`
        );
      }

      await milvusClient.use({ db_name: db });

      // Return the address and the database (if it exists, otherwise return 'default')
      return {
        clientId: milvusClient.clientId,
        database: db,
      };
    } catch (error) {
      throw error;
    }
  }

  async flush(clientId: string, data: FlushReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.flush(data);
    return res;
  }

  async getMetrics(clientId: string): Promise<GetMetricsResponse> {
    const { milvusClient } = clientCache.get(clientId);

    const res = milvusClient.getMetric({
      request: { metric_type: 'system_info' },
    });
    return res;
  }

  async closeConnection(clientId: string): Promise<CONNECT_STATUS> {
    if (clientCache.has(clientId)) {
      const { milvusClient } = clientCache.get(clientId);

      const res = await milvusClient.closeConnection();

      // clear crons
      cronsManager.deleteCronJob(clientId);

      // clear cache on disconnect
      clientCache.delete(milvusClient.clientId);
      return res;
    }
  }

  async useDatabase(clientId: string, db: string) {
    const { milvusClient } = clientCache.get(clientId);

    // get the database from the cache
    const cache = clientCache.get(clientId);
    const currentDatabase = cache.database;

    if (currentDatabase !== db) {
      // use the database
      const res = milvusClient.use({
        db_name: db,
      });

      // clear crons
      cronsManager.deleteCronJob(clientId);

      // update the database in the cache
      cache.database = db;
      return res;
    }
  }
}
