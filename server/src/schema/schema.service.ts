import {
  CreateIndexReq,
  DescribeIndexReq,
  DropIndexReq,
  GetIndexBuildProgressReq,
  GetIndexStateReq,
} from '@zilliz/milvus2-sdk-node';
import { throwErrorFromSDK } from '../utils/Error';
import { MilvusService } from '../milvus/milvus.service';

export class SchemaService {
  constructor(private milvusService: MilvusService) {}

  async createIndex(data: CreateIndexReq) {
    const res = await this.milvusService.client.createIndex(data);
    throwErrorFromSDK(res);
    return res;
  }

  async describeIndex(data: DescribeIndexReq) {
    const res = await this.milvusService.client.describeIndex(data);
    if (res.status.error_code === 'IndexNotExist') {
      return res;
    }
    throwErrorFromSDK(res.status);
    return res;
  }

  async dropIndex(data: DropIndexReq) {
    const res = await this.milvusService.client.dropIndex(data);
    throwErrorFromSDK(res);
    return res;
  }
}
