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
  RenameCollectionReq,
  AlterAliasReq,
  CreateAliasReq,
  DropAliasReq,
  ShowCollectionsReq,
  ShowCollectionsType,
  DeleteEntitiesReq,
} from '@zilliz/milvus2-sdk-node';
import { throwErrorFromSDK } from '../utils/Error';
import { findKeyValue, genRows } from '../utils/Helper';
import { ROW_COUNT } from '../utils/Const';
import { QueryDto, ImportSampleDto, GetReplicasDto } from './dto';

export class CollectionsService {
  constructor(private milvusService: MilvusService) {}

  async getCollections(data?: ShowCollectionsReq) {
    const res = await this.milvusService.client.showCollections(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async createCollection(data: CreateCollectionReq) {
    const res = await this.milvusService.client.createCollection(data);
    throwErrorFromSDK(res);
    return res;
  }

  async describeCollection(data: DescribeCollectionReq) {
    const res = await this.milvusService.client.describeCollection(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async renameCollection(data: RenameCollectionReq) {
    const res = await this.milvusService.client.renameCollection(data);
    throwErrorFromSDK(res);
    return res;
  }

  async dropCollection(data: DropCollectionReq) {
    const res = await this.milvusService.client.dropCollection(data);
    throwErrorFromSDK(res);
    return res;
  }

  async loadCollection(data: LoadCollectionReq) {
    const res = await this.milvusService.client.loadCollection(data);
    throwErrorFromSDK(res);
    return res;
  }

  async releaseCollection(data: ReleaseLoadCollectionReq) {
    const res = await this.milvusService.client.releaseCollection(data);
    throwErrorFromSDK(res);
    return res;
  }

  async getCollectionStatistics(data: GetCollectionStatisticsReq) {
    const res = await this.milvusService.client.getCollectionStatistics(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async insert(data: InsertReq) {
    const res = await this.milvusService.client.insert(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async deleteEntities(data: DeleteEntitiesReq) {
    const res = await this.milvusService.client.deleteEntities(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async vectorSearch(data: SearchReq) {
    const res = await this.milvusService.client.search(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async createAlias(data: CreateAliasReq) {
    const res = await this.milvusService.client.createAlias(data);
    throwErrorFromSDK(res);
    return res;
  }

  async alterAlias(data: AlterAliasReq) {
    const res = await this.milvusService.client.alterAlias(data);
    throwErrorFromSDK(res);
    return res;
  }

  async dropAlias(data: DropAliasReq) {
    const res = await this.milvusService.client.dropAlias(data);
    throwErrorFromSDK(res);
    return res;
  }

  async getReplicas(data: GetReplicasDto) {
    const res = await this.milvusService.client.getReplicas(data);
    return res;
  }

  async query(
    data: {
      collection_name: string;
    } & QueryDto
  ) {
    const res = await this.milvusService.client.query(data);
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
    const res = await this.milvusService.client.getIndexState(data);
    return res;
  }

  /**
   * Get all collections meta data
   * @returns {id:string, collection_name:string, schema:Field[], autoID:boolean, rowCount: string, consistency_level:string}
   */
  async getAllCollections() {
    const data: any = [];
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
          v => v.is_primary_key === true
        )?.autoID;

        const loadCollection = loadedCollections.data.find(
          v => v.name === name
        );

        const loadedPercentage = !loadCollection
          ? '-1'
          : loadCollection.loadedPercentage;

        const replicas: any = loadCollection
          ? await this.getReplicas({
              collectionID: collectionInfo.collectionID,
            })
          : [];

        data.push({
          aliases: collectionInfo.aliases,
          collection_name: name,
          schema: collectionInfo.schema,
          description: collectionInfo.schema.description,
          autoID,
          rowCount: findKeyValue(collectionStatistics.stats, ROW_COUNT),
          id: collectionInfo.collectionID,
          loadedPercentage,
          createdTime: parseInt(collectionInfo.created_utc_timestamp, 10),
          index_status: indexRes.state,
          consistency_level: collectionInfo.consistency_level,
          replicas: replicas && replicas.replicas,
        });
      }
    }
    // add default sort - Descending order
    data.sort((a: any, b: any) => b.createdTime - a.createdTime);
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

  /**
   * Load sample data into collection
   */
  async importSample({ collection_name, size }: ImportSampleDto) {
    const collectionInfo = await this.describeCollection({ collection_name });
    const fields_data = genRows(
      collectionInfo.schema.fields,
      parseInt(size, 10)
    );

    return await this.insert({ collection_name, fields_data });
  }
}
