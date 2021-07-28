import { Injectable } from '@nestjs/common';
import { MilvusService } from '../milvus/milvus.service';
import {
  CreateCollectionReq,
  DescribeCollectionReq,
  DropCollectionReq,
  GetCollectionStatisticsReq,
  GetIndexStateReq,
  InsertReq,
  LoadCollectionReq,
  ReleaseLoadCollectionReq,
  SearchReq,
} from '@zilliz/milvus2-sdk-node/dist/milvus/types';
import { throwErrorFromSDK } from '../utils/Error';
import { findKeyValue } from '../utils/Helper';
import { ROW_COUNT } from '../utils/Const';
import {
  ShowCollectionsReq,
  ShowCollectionsType,
} from '@zilliz/milvus2-sdk-node/dist/milvus/types/Collection';
@Injectable()
export class CollectionsService {
  constructor(private milvusService: MilvusService) {}

  get milvusClient() {
    return this.milvusService.milvusClientGetter;
  }

  async getCollectionNames(data?: ShowCollectionsReq) {
    const res = await this.milvusClient.showCollections(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async createCollection(data: CreateCollectionReq) {
    const res = await this.milvusClient.createCollection(data);
    throwErrorFromSDK(res);
    return res;
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

  async insert(data: InsertReq) {
    const res = await this.milvusClient.insert(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async vectorSearch(data: SearchReq) {
    const res = await this.milvusClient.search(data);
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

  /**
   * Get all collections meta data
   * @returns {id:string, collection_name:string, schema:Field[], autoID:boolean, rowCount: string}
   */
  async getAllCollections() {
    const data = [];
    const res = await this.getCollectionNames();
    const loadedCollections = await this.getCollectionNames({
      type: ShowCollectionsType.Loaded,
    });
    if (res.collection_names.length > 0) {
      for (const name of res.collection_names) {
        const collectionInfo = await this.describeCollection({
          collection_name: name,
        });
        const collectionStatistics = await this.getCollectionStatistics({
          collection_name: name,
        });
        const autoID = collectionInfo.schema.fields.find(
          (v) => v.is_primary_key === true,
        ).autoID;

        data.push({
          collection_name: name,
          schema: collectionInfo.schema,
          description: collectionInfo.schema.description,
          autoID,
          rowCount: findKeyValue(collectionStatistics.stats, ROW_COUNT),
          id: collectionInfo.collectionID,
          isLoaded: loadedCollections.collection_names.includes(name),
          createdTime: collectionInfo.created_utc_timestamp,
        });
      }
    }
    return data;
  }

  async getLoadedColletions() {
    const data = [];
    const res = await this.getCollectionNames({
      type: ShowCollectionsType.Loaded,
    });
    if (res.collection_names.length > 0) {
      for (const [index, value] of res.collection_names.entries()) {
        const collectionStatistics = await this.getCollectionStatistics({
          collection_name: value,
        });
        data.push({
          id: res.collection_ids[index],
          collection_name: value,
          rowCount: findKeyValue(collectionStatistics.stats, ROW_COUNT),
        });
      }
    }
    return data;
  }

  /**
   * Get collections statistics data
   * @returns {collectionCount:number, totalData:number}
   */
  async getStatistics() {
    const data = {
      collectionCount: 0,
      totalData: 0,
    };
    const res = await this.getCollectionNames();
    data.collectionCount = res.collection_names.length;
    if (res.collection_names.length > 0) {
      for (const name of res.collection_names) {
        const collectionStatistics = await this.getCollectionStatistics({
          collection_name: name,
        });
        const rowCount = findKeyValue(collectionStatistics.stats, ROW_COUNT);
        data.totalData += isNaN(Number(rowCount)) ? 0 : Number(rowCount);
      }
    }
    return data;
  }

  /**
   * Get all collection index status
   * @returns {collection_name:string, index_state: IndexState}[]
   */
  async getCollectionsIndexStatus() {
    const data = [];
    const res = await this.getCollectionNames();
    if (res.collection_names.length > 0) {
      for (const name of res.collection_names) {
        const indexRes = await this.getIndexStatus({ collection_name: name });
        data.push({
          collection_name: name,
          index_state: indexRes.state,
        });
      }
    }
    return data;
  }
}
