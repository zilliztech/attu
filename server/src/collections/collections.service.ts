import { Injectable } from '@nestjs/common';
import { MilvusService } from '../milvus/milvus.service';
import {
  CreateCollectionReq,
  DescribeCollectionReq,
  DropCollectionReq,
  GetCollectionStatisticsReq,
  GetIndexStateReq,
  LoadCollectionReq,
  ReleaseLoadCollectionReq,
} from '@zilliz/milvus-sdk-node-dev/dist/milvus/types'; // todo: need improve like export types in root file.
import { throwErrorFromSDK } from 'src/utils/Error';
@Injectable()
export class CollectionsService {
  constructor(private milvusService: MilvusService) {}

  get milvusClient() {
    return this.milvusService.milvusClientGetter;
  }

  async getCollectionNames() {
    const res = await this.milvusClient.showCollections();
    throwErrorFromSDK(res.status);
    return res;
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

  async loadCollection(data: LoadCollectionReq) {
    const res = await this.milvusClient.loadCollection(data);
    throwErrorFromSDK(res);
    return res;
  }

  async releaseCollection(data: ReleaseLoadCollectionReq) {
    const res = await this.milvusClient.releaseCollection(data);
    throwErrorFromSDK(res);
    return res;
  }

  async getCollectionStatistics(data: GetCollectionStatisticsReq) {
    const res = await this.milvusClient.getCollectionStatistics(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  /**
   * We do not throw error for this.
   * Because if collection dont have index, it will throw error.
   * We need wait for milvus error code.
   * @param data
   * @returns
   */
  async getIndexStatus(data: GetIndexStateReq) {
    const res = await this.milvusClient.getIndexState(data);
    return res;
  }

  async showCollections() {
    const data = [];
    const res = await this.getCollectionNames();
    if (res.collection_names.length > 0) {
      for (const name of res.collection_names) {
        const collectionInfo = await this.describeCollection({
          collection_name: name,
        });
        const collectionStatistics = await this.getCollectionStatistics({
          collection_name: name,
        });
        data.push({
          collection_name: name,
          // schema: collectionInfo.schema,
          description: collectionInfo.schema.description,
          autoID: collectionInfo.schema.autoID,
          rowCount: collectionStatistics.stats.find(
            (v) => v.key === 'row_count',
          ).value,
          // id: collectionInfo.collectionId
        });
      }
    }
    return data;
  }

  async getCollectionsIndexStatus() {
    const data = [];
    const res = await this.getCollectionNames();
    if (res.collection_names.length > 0) {
      for (const name of res.collection_names) {
        const indexRes = await this.getIndexStatus({ collection_name: name });
        data.push({
          collectionName: name,
          indexState: indexRes.state,
        });
      }
    }
    return data;
  }
}
