import {
  MilvusClient,
  FlushReq,
  GetMetricsResponse,
} from '@zilliz/milvus2-sdk-node';
import HttpErrors from 'http-errors';
import LruCache from 'lru-cache';
import { HTTP_STATUS_CODE } from '../utils/Const';
import { DEFAULT_MILVUS_PORT } from '../utils';
import { connectivityState } from '@grpc/grpc-js';

export class MilvusService {
  // Share with all instances, so activeAddress is static
  static activeAddress: string;
  static activeMilvusClient: MilvusClient;

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

      // throw new Error('Please connect milvus first');
    }
  }

  async connectMilvus(
    data: {
      address: string;
      username?: string;
      password?: string;
    },
    cache: LruCache<any, any>
  ) {
    const { address, username, password } = data;
    // grpc only need address without http
    const milvusAddress = MilvusService.formatAddress(address);

    try {
      const milvusClient: MilvusClient = new MilvusClient({
        address: milvusAddress,
        username,
        password,
      });

      // don't break attu
      await milvusClient.connectPromise.catch(error => {
        throw HttpErrors(HTTP_STATUS_CODE.FORBIDDEN, error);
      });

      // check healthy
      const res = await milvusClient.checkHealth();

      if (res.isHealthy) {
        MilvusService.activeAddress = address;
        cache.set(address, milvusClient);
        return { address };
      } else {
        throw new Error('Milvus is not ready yet.');
      }
    } catch (error) {
      // if milvus is not working, delete connection.
      cache.dump();
      throw HttpErrors(HTTP_STATUS_CODE.FORBIDDEN, error);
    }
  }

  async checkConnect(address: string, cache: LruCache<any, any>) {
    const milvusAddress = MilvusService.formatAddress(address);
    return { connected: cache.has(milvusAddress) };
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
