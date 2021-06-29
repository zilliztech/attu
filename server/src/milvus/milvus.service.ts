import { Injectable } from '@nestjs/common';
import { MilvusNode } from '@zilliz/milvus2-sdk-node';
@Injectable()
export class MilvusService {
  private milvusAddress: string;
  private milvusClient: MilvusNode;

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
      this.milvusClient = new MilvusNode(milvusAddress);
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
}
