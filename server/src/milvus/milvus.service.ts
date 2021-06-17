import { Injectable } from '@nestjs/common';
import { MilvusNode } from '@zilliz/milvus-sdk-node-dev';
@Injectable()
export class MilvusService {
  private milvusAddress: string;
  private milvusClient: MilvusNode;

  constructor() {
    this.milvusAddress = '';
    // todo: this is easy for test. need delete it before publish
    // this.milvusClient = new MilvusNode('127.0.0.1:19530');
  }

  get milvusAddressGetter() {
    return this.milvusAddress;
  }

  get milvusClientGetter() {
    return this.milvusClient;
  }

  async connectMilvus(address: string) {
    try {
      this.milvusClient = new MilvusNode(address);
      this.milvusAddress = address;
      await this.milvusClient.hasCollection({
        collection_name: 'not_exist',
      });
      return { address: this.milvusAddress };
    } catch (error) {
      throw new Error('Connect milvus failed, check your milvus address.');
    }
  }

  async checkConnect(address: string) {
    return {
      connected: this.milvusAddress ? this.milvusAddress === address : false,
    };
  }
}
