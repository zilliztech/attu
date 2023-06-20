import {
  MilvusClient,
  FlushReq,
  GetMetricsResponse,
} from '@zilliz/milvus2-sdk-node';
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

  get client() {
    return MilvusService.activeMilvusClient;
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
    },
    cache: LruCache<any, any>
  ) {
    const { address, username, password } = data;
    // grpc only need address without http
    const milvusAddress = MilvusService.formatAddress(address);
    const hasAuth = username !== undefined && password !== undefined;

    try {
      const milvusClient: MilvusClient = hasAuth
        ? new MilvusClient({
            address: milvusAddress,
            username,
            password,
          })
        : new MilvusClient({ address });

      // don't break attu
      await milvusClient.connectPromise.catch(error => {
        throw HttpErrors(HTTP_STATUS_CODE.BAD_REQUEST, error);
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
      cache.del(address);
      throw HttpErrors(HTTP_STATUS_CODE.BAD_REQUEST, error);
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
}
