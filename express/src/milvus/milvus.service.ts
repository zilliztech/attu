import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import {
  FlushReq,
  GetMetricsResponse,
} from '@zilliz/milvus2-sdk-node/dist/milvus/types';

export class MilvusService {
  // Share with all instances, so activeAddress is static
  static activeAddress: string;
  private milvusClients: { [x: string]: MilvusClient };

  constructor() {
    this.milvusClients = {};
  }

  get activeMilvusClient() {
    // undefined means not connect yet, will throw error to client.
    return this.milvusClients[MilvusService.activeAddress];
  }

  get collectionManager() {
    this.checkMilvus();
    return this.activeMilvusClient.collectionManager;
  }

  get partitionManager() {
    this.checkMilvus();
    return this.activeMilvusClient.partitionManager;
  }

  get indexManager() {
    this.checkMilvus();
    return this.activeMilvusClient.indexManager;
  }

  get dataManager() {
    this.checkMilvus();
    return this.activeMilvusClient.dataManager;
  }

  private checkMilvus() {
    if (!this.activeMilvusClient) {
      throw new Error('Please connect milvus first');
    }
  }

  formatAddress(address: string) {
    return address.replace(/(http|https):\/\//, '');
  }

  async connectMilvus(address: string) {
    // grpc only need address without http
    const milvusAddress = this.formatAddress(address);
    try {
      const milvusClient = new MilvusClient(milvusAddress);
      await milvusClient.collectionManager.hasCollection({
        collection_name: 'not_exist',
      });
      MilvusService.activeAddress = address;
      this.milvusClients[milvusAddress] = milvusClient;
      return { address };
    } catch (error) {
      // if milvus is not working, delete connection.
      delete this.milvusClients[milvusAddress];
      throw new Error('Connect milvus failed, check your milvus address.');
    }
  }

  async checkConnect(address: string) {
    const milvusAddress = this.formatAddress(address);
    if (!Object.keys(this.milvusClients).includes(milvusAddress)) {
      return { connected: false };
    }
    const res = await this.connectMilvus(address);
    return {
      connected: res.address ? true : false,
    };
  }

  async flush(data: FlushReq) {
    const res = await this.activeMilvusClient.dataManager.flush(data);
    return res;
  }

  async getMetrics(): Promise<GetMetricsResponse> {
    const res = await this.activeMilvusClient.dataManager.getMetric({
      request: { metric_type: 'system_info' },
    });
    return res;
  }
}
