import { Injectable } from '@nestjs/common';
import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import { FlushReq } from '@zilliz/milvus2-sdk-node/dist/milvus/types';
@Injectable()
export class MilvusService {
  private milvusAddress: string;
  private milvusClient: MilvusClient;

  constructor() {
    this.milvusAddress = '';
  }

  get milvusAddressGetter() {
    return this.milvusAddress;
  }

  get milvusClientGetter() {
    return this.milvusClient;
  }

  async connectMilvus(address: string) {
    const milvusAddress = address.replace(/(http|https):\/\//, '');
    try {
      this.milvusClient = new MilvusClient(milvusAddress);
      await this.milvusClient.hasCollection({
        collection_name: 'not_exist',
      });
      this.milvusAddress = address;
      return { address: this.milvusAddress };
    } catch (error) {
      throw new Error('Connect milvus failed, check your milvus address.');
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
    const res = await this.milvusClient.flush(data);
    return res;
  }
}
