import { MilvusClient } from "@zilliz/milvus2-sdk-node";
import {
  FlushReq,
  GetMetricsResponse,
} from "@zilliz/milvus2-sdk-node/dist/milvus/types";

export class MilvusService {
  private milvusAddress: string;
  private milvusClient: MilvusClient;

  constructor() {
    this.milvusAddress = "";
  }

  get milvusAddressGetter() {
    return this.milvusAddress;
  }

  get milvusClientGetter() {
    return this.milvusClient;
  }

  get collectionManager() {
    this.checkMilvus();
    return this.milvusClient.collectionManager;
  }

  get partitionManager() {
    this.checkMilvus();
    return this.milvusClient.partitionManager;
  }

  get indexManager() {
    this.checkMilvus();
    return this.milvusClient.indexManager;
  }

  get dataManager() {
    this.checkMilvus();
    return this.milvusClient.dataManager;
  }

  private checkMilvus() {
    if (!this.milvusClient) {
      throw new Error("Please connect milvus first");
    }
  }

  async connectMilvus(address: string) {
    // grpc only need address without http
    const milvusAddress = address.replace(/(http|https):\/\//, "");
    try {
      this.milvusClient = new MilvusClient(milvusAddress);
      await this.milvusClient.collectionManager.hasCollection({
        collection_name: "not_exist",
      });
      this.milvusAddress = address;
      return { address: this.milvusAddress };
    } catch (error) {
      throw new Error("Connect milvus failed, check your milvus address.");
    }
  }

  async checkConnect(address: string) {
    if (address !== this.milvusAddress) {
      return { connected: false };
    }
    const res = await this.connectMilvus(address);
    return {
      connected: res.address ? true : false,
    };
  }

  async flush(data: FlushReq) {
    const res = await this.milvusClient.dataManager.flush(data);
    return res;
  }

  async getMetrics(): Promise<GetMetricsResponse> {
    const res = await this.milvusClient.dataManager.getMetric({
      request: { metric_type: "system_info" },
    });
    return res;
  }
}
