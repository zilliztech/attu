import {
  MilvusClient,
  FlushReq,
  GetMetricsResponse,
  ClientConfig,
} from '@zilliz/milvus2-sdk-node';
import HttpErrors from 'http-errors';
import { HTTP_STATUS_CODE } from '../utils/Const';
import { DEFAULT_MILVUS_PORT } from '../utils';
import { connectivityState } from '@grpc/grpc-js';
import { DatabasesService } from '../database/databases.service';
import { clientCache } from '../app';

export class MilvusService {
  private databaseService: DatabasesService;
  // Share with all instances, so activeAddress is static
  static activeAddress: string;
  static activeMilvusClient: MilvusClient;

  constructor() {
    this.databaseService = new DatabasesService(this);
  }

  get sdkInfo() {
    return MilvusClient.sdkInfo;
  }

  get client() {
    return MilvusService.activeMilvusClient;
  }

  static formatAddress(address: string) {
    // remove http prefix from address
    const ip = address.replace(/(http):\/\//, '');
    return ip.includes(':') ? ip : `${ip}:${DEFAULT_MILVUS_PORT}`;
  }

  checkMilvus() {
    if (!MilvusService.activeMilvusClient) {
      throw HttpErrors(
        HTTP_STATUS_CODE.FORBIDDEN,
        'Can not find your connection, please check your connection settings.'
      );
    }
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

      // Set the active Milvus client to the newly created client
      MilvusService.activeMilvusClient = milvusClient;

      try {
        // Attempt to connect to the Milvus server
        await milvusClient.connectPromise;
      } catch (error) {
        // If the connection fails, clear the cache and throw an error
        clientCache.dump();
        throw new Error('Failed to connect to Milvus: ' + error);
      }

      // Check the health of the Milvus server
      const res = await milvusClient.checkHealth();

      // If the server is not healthy, throw an error
      if (!res.isHealthy) {
        throw new Error('Milvus is not ready yet.');
      }

      // If the server is healthy, set the active address and add the client to the cache
      MilvusService.activeAddress = address;
      clientCache.set(address, milvusClient);

      // Create a new database service and check if the specified database exists
      let hasDatabase = false;
      try {
        hasDatabase = await this.databaseService.hasDatabase(database);
      } catch (_) {
        // ignore error
      }

      // if database exists, use this db
      if (hasDatabase) {
        await this.databaseService.use(database);
      }

      // Return the address and the database (if it exists, otherwise return 'default')
      return { address, database: hasDatabase ? database : 'default' };
    } catch (error) {
      // If any error occurs, clear the cache and throw the error
      clientCache.dump();
      throw error;
    }
  }

  async checkConnect(address: string) {
    const milvusAddress = MilvusService.formatAddress(address);
    return { connected: clientCache.has(milvusAddress) };
  }

  async flush(data: FlushReq) {
    const res = await MilvusService.activeMilvusClient.flush(data);
    return res;
  }

  async getMetrics(): Promise<GetMetricsResponse> {
    const res = await MilvusService.activeMilvusClient.getMetric({
      request: { metric_type: 'system_info' },
    });
    return res;
  }

  closeConnection(): connectivityState {
    const res = MilvusService.activeMilvusClient.closeConnection();
    return res;
  }

  async useDatabase(db: string) {
    const res = await MilvusService.activeMilvusClient.use({
      db_name: db,
    });
    return res;
  }
}
