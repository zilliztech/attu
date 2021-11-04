import { MilvusService } from "../milvus/milvus.service";
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
} from "@zilliz/milvus2-sdk-node/dist/milvus/types";
import { throwErrorFromSDK } from "../utils/Error";
import { findKeyValue } from "../utils/Helper";
import { ROW_COUNT } from "../utils/Const";
import {
  ShowCollectionsReq,
  ShowCollectionsType,
} from "@zilliz/milvus2-sdk-node/dist/milvus/types/Collection";

export class CollectionsService {
  constructor(private milvusService: MilvusService) {}

  get collectionManager() {
    return this.milvusService.collectionManager;
  }

  get dataManager() {
    return this.milvusService.dataManager;
  }

  get indexManager() {
    return this.milvusService.indexManager;
  }

  async getCollections(data?: ShowCollectionsReq) {
    const res = await this.collectionManager.showCollections(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async createCollection(data: CreateCollectionReq) {
    const res = await this.collectionManager.createCollection(data);
    throwErrorFromSDK(res);
    return res;
  }

  async describeCollection(data: DescribeCollectionReq) {
    const res = await this.collectionManager.describeCollection(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async dropCollection(data: DropCollectionReq) {
    const res = await this.collectionManager.dropCollection(data);
    throwErrorFromSDK(res);
    return res;
  }

  async loadCollection(data: LoadCollectionReq) {
    const res = await this.collectionManager.loadCollection(data);
    throwErrorFromSDK(res);
    return res;
  }

  async releaseCollection(data: ReleaseLoadCollectionReq) {
    const res = await this.collectionManager.releaseCollection(data);
    throwErrorFromSDK(res);
    return res;
  }

  async getCollectionStatistics(data: GetCollectionStatisticsReq) {
    const res = await this.collectionManager.getCollectionStatistics(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async insert(data: InsertReq) {
    const res = await this.dataManager.insert(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async vectorSearch(data: SearchReq) {
    const res = await this.dataManager.search(data);
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
    const res = await this.indexManager.getIndexState(data);
    return res;
  }

  /**
   * Get all collections meta data
   * @returns {id:string, collection_name:string, schema:Field[], autoID:boolean, rowCount: string}
   */
  async getAllCollections() {
    const data = [];
    const res = await this.getCollections();
    const loadedCollections = await this.getCollections({
      type: ShowCollectionsType.Loaded,
    });
    if (res.data.length > 0) {
      for (const item of res.data) {
        const { name } = item;

        const collectionInfo = await this.describeCollection({
          collection_name: name,
        });

        const collectionStatistics = await this.getCollectionStatistics({
          collection_name: name,
        });

        const indexRes = await this.getIndexStatus({
          collection_name: item.name,
        });

        const autoID = collectionInfo.schema.fields.find(
          (v) => v.is_primary_key === true
        )?.autoID;

        const loadCollection = loadedCollections.data.find(
          (v) => v.name === name
        );

        const loadedPercentage = !loadCollection
          ? "-1"
          : loadCollection.loadedPercentage;

        data.push({
          collection_name: name,
          schema: collectionInfo.schema,
          description: collectionInfo.schema.description,
          autoID,
          rowCount: findKeyValue(collectionStatistics.stats, ROW_COUNT),
          id: collectionInfo.collectionID,
          loadedPercentage,
          createdTime: parseInt(collectionInfo.created_utc_timestamp, 10),
          index_status: indexRes.state,
        });
      }
    }
    // add default sort - Descending order
    data.sort((a, b) => b.createdTime - a.createdTime);
    return data;
  }

  async getLoadedColletions() {
    const data = [];
    const res = await this.getCollections({
      type: ShowCollectionsType.Loaded,
    });
    if (res.data.length > 0) {
      for (const item of res.data) {
        const { id, name } = item;
        const collectionStatistics = await this.getCollectionStatistics({
          collection_name: name,
        });
        data.push({
          id,
          collection_name: name,
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
    const res = await this.getCollections();
    data.collectionCount = res.data.length;
    if (res.data.length > 0) {
      for (const item of res.data) {
        const collectionStatistics = await this.getCollectionStatistics({
          collection_name: item.name,
        });
        const rowCount = findKeyValue(collectionStatistics.stats, ROW_COUNT);
        data.totalData += isNaN(Number(rowCount)) ? 0 : Number(rowCount);
      }
    }
    return data;
  }

  /**
   * Get all collection index status
   * @returns {collection_name:string, index_status: IndexState}[]
   */
  async getCollectionsIndexStatus() {
    const data = [];
    const res = await this.getCollections();
    if (res.data.length > 0) {
      for (const item of res.data) {
        const indexRes = await this.getIndexStatus({
          collection_name: item.name,
        });
        data.push({
          collection_name: item.name,
          index_status: indexRes.state,
        });
      }
    }
    return data;
  }
}
