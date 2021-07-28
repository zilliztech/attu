import { Injectable } from '@nestjs/common';
import {
  CreateIndexReq,
  DescribeIndexReq,
  DropIndexReq,
  GetIndexBuildProgressReq,
  GetIndexStateReq,
} from '@zilliz/milvus2-sdk-node/dist/milvus/types';
import { throwErrorFromSDK } from '../utils/Error';
import { MilvusService } from '../milvus/milvus.service';

@Injectable()
export class SchemaService {
  constructor(private milvusService: MilvusService) { }

  get milvusClient() {
    return this.milvusService.milvusClientGetter;
  }

  async createIndex(data: CreateIndexReq) {
    const res = await this.milvusClient.createIndex(data);
    throwErrorFromSDK(res);
    return res;
  }

  async describeIndex(data: DescribeIndexReq) {
    const res = await this.milvusClient.describeIndex(data);
    if (res.status.error_code === 'IndexNotExist') {
      return res;
    }
    throwErrorFromSDK(res.status);
    return res;
  }

  async dropIndex(data: DropIndexReq) {
    const res = await this.milvusClient.dropIndex(data);
    throwErrorFromSDK(res);
    return res;
  }

  async getIndexState(data: GetIndexStateReq) {
    const res = await this.milvusClient.getIndexState(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async getIndexBuildProgress(data: GetIndexBuildProgressReq) {
    const res = await this.milvusClient.getIndexBuildProgress(data);
    throwErrorFromSDK(res.status);
    return res;
  }
}
