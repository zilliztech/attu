import { Injectable } from '@nestjs/common';

@Injectable()
export class MilvusService {
  private milvusAddress: string;

  constructor() {
    this.milvusAddress = '';
  }

  get milvusAddressGetter() {
    return this.milvusAddress;
  }

  connectMilvus(address: string) {
    this.milvusAddress = address;
    return { address: this.milvusAddress };
  }
}
