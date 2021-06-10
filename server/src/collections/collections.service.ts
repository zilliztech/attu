import { Injectable } from '@nestjs/common';
import { MilvusService } from '../milvus/milvus.service';
import {
  CreateCollectionReq,
  DescribeCollectionReq,
  DropCollectionReq,
  HasCollectionReq,
  GetCollectionStatisticsReq,
} from '@zilliz/milvus-sdk-node-dev/dist/milvus/types/Collection'; // todo: need improve like export types in root file.
import { throwErrorFromSDK } from 'src/utils/Error';
@Injectable()
export class CollectionsService {
  constructor(private milvusService: MilvusService) {}

  get milvusClient() {
    return this.milvusService.milvusClientGetter;
  }

  async showCollections() {
    const data = [];
    const res = await this.milvusClient.showCollections();
    throwErrorFromSDK(res.status);
    if (res.collection_names.length > 0) {
      for (const name of res.collection_names) {
        const collectionInfo = await this.describeCollection({
          collection_name: name,
        });
        throwErrorFromSDK(collectionInfo.status);
        const collectionStatistics = await this.getCollectionStatistics({
          collection_name: name,
        });
        throwErrorFromSDK(collectionStatistics.status);
        data.push({
          collection_name: name,
          schema: collectionInfo.schema,
          rowCount: collectionStatistics.stats.find(
            (v) => v.key === 'row_count',
          ).value,
          // id: collectionInfo.collectionId
        });
      }
    }
    return data;
  }

  async createCollection(data: CreateCollectionReq) {
    try {
      const res = await this.milvusClient.createCollection(data);
      throwErrorFromSDK(res);
      return res;
    } catch (error) {
      throw new Error(error);
    }
  }

  async describeCollection(data: DescribeCollectionReq) {
    const res = await this.milvusClient.describeCollection(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async dropCollection(data: DropCollectionReq) {
    const res = await this.milvusClient.dropCollection(data);
    throwErrorFromSDK(res);
    return res;
  }

  async getCollectionStatistics(data: GetCollectionStatisticsReq) {
    const res = await this.milvusClient.getCollectionStatistics(data);
    throwErrorFromSDK(res.status);
    return res;
  }
}
