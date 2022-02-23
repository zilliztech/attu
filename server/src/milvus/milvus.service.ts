import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import {
  FlushReq,
  GetMetricsResponse,
} from '@zilliz/milvus2-sdk-node/dist/milvus/types';
import HttpErrors from 'http-errors';
import LruCache from 'lru-cache';
import { HTTP_STATUS_CODE } from '../utils/Error';
export class MilvusService {
  // Share with all instances, so activeAddress is static
  static activeAddress: string;
  static activeMilvusClient: MilvusClient;

  get sdkInfo() {
    if (!MilvusService.activeMilvusClient) {
      return {};
    }
    return MilvusService.activeMilvusClient.sdkInfo;
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

  static formatAddress(address: string) {
    return address.replace(/(http|https):\/\//, '');
  }

  checkMilvus() {
    if (!MilvusService.activeMilvusClient) {
      throw HttpErrors(
        HTTP_STATUS_CODE.UNAUTHORIZED,
        'Please connect milvus first'
      );
      // throw new Error('Please connect milvus first');
    }
  }

  async connectMilvus(address: string, cache: LruCache<any, any>) {
    // grpc only need address without http
    const milvusAddress = MilvusService.formatAddress(address);
    try {
      const milvusClient = new MilvusClient(milvusAddress);
      await milvusClient.collectionManager.hasCollection({
        collection_name: 'not_exist',
      });
      MilvusService.activeAddress = address;
      cache.set(milvusAddress, milvusClient);
      return { address };
    } catch (error) {
      // if milvus is not working, delete connection.
      cache.del(milvusAddress);
      throw HttpErrors(
        HTTP_STATUS_CODE.BAD_REQUEST,
        'Connect milvus failed, check your milvus address.'
      );
    }
  }

  async checkConnect(address: string, cache: LruCache<any, any>) {
    const milvusAddress = MilvusService.formatAddress(address);
    if (!cache.has(milvusAddress)) {
      return { connected: false };
    }
    const res = await this.connectMilvus(address, cache);
    return {
      connected: res.address ? true : false,
    };
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
}
