import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import {
  FlushReq,
  GetMetricsResponse,
} from '@zilliz/milvus2-sdk-node/dist/milvus/types';
import HttpErrors from 'http-errors';
import LruCache from 'lru-cache';
import { HTTP_STATUS_CODE } from '../utils/Error';
import { DEFAULT_MILVUS_PORT } from '../utils/Const';
import { connectivityState } from '@grpc/grpc-js';

export class MilvusService {
  // Share with all instances, so activeAddress is static
  static activeAddress: string;
  static activeMilvusClient: MilvusClient;

  get sdkInfo() {
    return MilvusClient.sdkInfo;
  }

  get collectionManager() {
    this.checkMilvus();
    return MilvusService.activeMilvusClient.collectionManager;
  }

  get partitionManager() {
    this.checkMilvus();
    return MilvusService.activeMilvusClient.partitionManager;
  }

  get indexManager() {
    this.checkMilvus();
    return MilvusService.activeMilvusClient.indexManager;
  }

  get dataManager() {
    this.checkMilvus();
    return MilvusService.activeMilvusClient.dataManager;
  }

  get userManager() {
    this.checkMilvus();
    return MilvusService.activeMilvusClient.userManager;
  }

  static formatAddress(address: string) {
    // remove http or https prefix from address
    const ip = address.replace(/(http|https):\/\//, '');
    return ip.includes(':') ? ip : `${ip}:${DEFAULT_MILVUS_PORT}`;
  }

  checkMilvus() {
    if (!MilvusService.activeMilvusClient) {
      throw HttpErrors(
        HTTP_STATUS_CODE.FORBIDDEN,
        'Can not find your connection, please connect Milvus again'
      );

      // throw new Error('Please connect milvus first');
    }
  }

  async connectMilvus(
    data: {
      address: string;
      username?: string;
      password?: string;
      ssl?: boolean;
    },
    cache: LruCache<any, any>
  ) {
    const { address, username, password, ssl = false } = data;
    // grpc only need address without http
    const milvusAddress = MilvusService.formatAddress(address);
    const hasAuth = username !== undefined && password !== undefined;
    try {
      const milvusClient: MilvusClient = hasAuth
        ? new MilvusClient(milvusAddress, ssl, username, password)
        : new MilvusClient(milvusAddress, ssl);

      // check healthy
      const res = await milvusClient.checkHealth();

      if (res.isHealthy) {
        MilvusService.activeAddress = address;
        cache.set(milvusAddress, milvusClient);
        return { address };
      } else {
        throw new Error('Milvus is not ready yet.');
      }
    } catch (error) {
      // if milvus is not working, delete connection.
      cache.del(milvusAddress);
      throw HttpErrors(HTTP_STATUS_CODE.BAD_REQUEST, error);
    }
  }

  async checkConnect(address: string, cache: LruCache<any, any>) {
    const milvusAddress = MilvusService.formatAddress(address);
    return { connected: cache.has(milvusAddress) };
  }

  async flush(data: FlushReq) {
    const res = await MilvusService.activeMilvusClient.dataManager.flush(data);
    return res;
  }

  async getMetrics(): Promise<GetMetricsResponse> {
    const res = await MilvusService.activeMilvusClient.dataManager.getMetric({
      request: { metric_type: 'system_info' },
    });
    return res;
  }

  closeConnection(): connectivityState {
    const res = MilvusService.activeMilvusClient.closeConnection();
    return res;
  }
}
