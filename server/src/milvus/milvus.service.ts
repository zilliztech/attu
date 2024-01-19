import {
  MilvusClient,
  FlushReq,
  GetMetricsResponse,
  ClientConfig,
  DescribeIndexResponse,
} from '@zilliz/milvus2-sdk-node';
import { LRUCache } from 'lru-cache';
import { DEFAULT_MILVUS_PORT, INDEX_TTL } from '../utils';
import { connectivityState } from '@grpc/grpc-js';
import { DatabasesService } from '../database/databases.service';
import { clientCache } from '../app';

export class MilvusService {
  private databaseService: DatabasesService;

  constructor() {
    this.databaseService = new DatabasesService();
  }

  get sdkInfo() {
    return MilvusClient.sdkInfo;
  }

  static formatAddress(address: string) {
    // remove http prefix from address
    const ip = address.replace(/(http):\/\//, '');
    return ip.includes(':') ? ip : `${ip}:${DEFAULT_MILVUS_PORT}`;
  }

  async connectMilvus(data: {
    address: string;
    username?: string;
    password?: string;
    database?: string;
  }) {
    // Destructure the data object to get the connection details
    const { address, username, password, database } = data;
    // Format the address to remove the http prefix
    const milvusAddress = MilvusService.formatAddress(address);

    try {
      // Create a new Milvus client with the provided connection details
      const clientOptions: ClientConfig = {
        address: milvusAddress,
        username,
        password,
        logLevel: process.env.ATTU_LOG_LEVEL || 'info',
      };

      if (process.env.ROOT_CERT_PATH) {
        clientOptions.tls = {
          rootCertPath: process.env.ROOT_CERT_PATH,
        };

        if (process.env.PRIVATE_KEY_PATH) {
          clientOptions.tls.privateKeyPath = process.env.PRIVATE_KEY_PATH;
        }

        if (process.env.CERT_CHAIN_PATH) {
          clientOptions.tls.certChainPath = process.env.CERT_CHAIN_PATH;
        }

        if (process.env.SERVER_NAME) {
          clientOptions.tls.serverName = process.env.SERVER_NAME;
        }
      }
      // create the client
      const milvusClient: MilvusClient = new MilvusClient(clientOptions);

      try {
        // Attempt to connect to the Milvus server
        await milvusClient.connectPromise;
      } catch (error) {
        // If the connection fails, clear the cache and throw an error
        clientCache.delete(milvusClient.clientId);
        throw new Error('Failed to connect to Milvus: ' + error);
      }

      // Check the health of the Milvus server
      const res = await milvusClient.checkHealth();

      // If the server is not healthy, throw an error
      if (!res.isHealthy) {
        throw new Error('Milvus is not ready yet.');
      }

      // If the server is healthy, set the active address and add the client to the cache
      clientCache.set(milvusClient.clientId, {
        milvusClient,
        address,
        indexCache: new LRUCache<string, DescribeIndexResponse>({
          ttl: INDEX_TTL,
          ttlAutopurge: true,
        }),
      });

      // Create a new database service and check if the specified database exists
      let hasDatabase = false;
      try {
        hasDatabase = await this.databaseService.hasDatabase(
          milvusClient.clientId,
          database
        );
      } catch (_) {
        // ignore error
      }

      // if database exists, use this db
      if (hasDatabase) {
        await this.databaseService.use(milvusClient.clientId, database);
      }

      // Return the address and the database (if it exists, otherwise return 'default')
      return {
        address,
        database: hasDatabase ? database : 'default',
        clientId: milvusClient.clientId,
      };
    } catch (error) {
      // If any error occurs, clear the cache and throw the error
      clientCache.dump();
      throw error;
    }
  }

  async checkConnect(clientId: string, address: string) {
    const milvusAddress = MilvusService.formatAddress(address);
    return { connected: clientCache.has(milvusAddress) };
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

  closeConnection(clientId: string): connectivityState {
    const { milvusClient } = clientCache.get(clientId);

    const res = milvusClient.closeConnection();
    return res;
  }

  async useDatabase(clientId: string, db: string) {
    const { milvusClient } = clientCache.get(clientId);

    const res = milvusClient.use({
      db_name: db,
    });
    return res;
  }
}
