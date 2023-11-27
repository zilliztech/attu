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
  GetCompactionStateReq,
  GetQuerySegmentInfoReq,
  GePersistentSegmentInfoReq,
  CompactReq,
  HasCollectionReq,
  CountReq,
} from '@zilliz/milvus2-sdk-node';
import { Parser } from '@json2csv/plainjs';
import { throwErrorFromSDK, findKeyValue, genRows, ROW_COUNT } from '../utils';
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

  async count(data: CountReq) {
    let count = 0;
    try {
      const countRes = await this.milvusService.client.count(data);
      count = countRes.data;
    } catch (error) {
      const collectionStatisticsRes = await this.getCollectionStatistics(data);
      count = collectionStatisticsRes.data.row_count;
    }
    return count;
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
    const now = Date.now();
    const res = await this.milvusService.client.search(data);
    const after = Date.now();

    throwErrorFromSDK(res.status);
    Object.assign(res, { latency: after - now });
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
    const now = Date.now();
    const res = await this.milvusService.client.query(data);

    const after = Date.now();

    throwErrorFromSDK(res.status);
    Object.assign(res, { latency: after - now });
    return res;
  }

  /**
   * We do not throw error for this.
   * Because if collection dont have index, it will throw error.
   * We need wait for milvus error code.
   * @param data
   * @returns
   */
  async getIndexInfo(data: GetIndexStateReq) {
    const res = await this.milvusService.client.describeIndex(data);
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

        let count: number | string;

        const collectionStatisticsRes = await this.getCollectionStatistics({
          collection_name: name,
        });
        count = collectionStatisticsRes.data.row_count;
        // try {
        //   const countRes = await this.count({
        //     collection_name: name,
        //   });
        //   count = countRes.data;
        // } catch (error) {
        // }

        const indexRes = await this.getIndexInfo({
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

        let replicas;
        try {
          replicas = loadCollection
            ? await this.getReplicas({
                collectionID: collectionInfo.collectionID,
              })
            : replicas;
        } catch (e) {
          console.log('ignore getReplica');
        }

        data.push({
          aliases: collectionInfo.aliases,
          collection_name: name,
          schema: collectionInfo.schema,
          description: collectionInfo.schema.description,
          autoID,
          rowCount: count,
          id: collectionInfo.collectionID,
          loadedPercentage,
          createdTime: parseInt(collectionInfo.created_utc_timestamp, 10),
          index_descriptions: indexRes,
          consistency_level: collectionInfo.consistency_level,
          replicas: replicas && replicas.replicas,
        });
      }
    }
    // add default sort - Descending order
    data.sort((a: any, b: any) => b.createdTime - a.createdTime);
    return data;
  }

  async getLoadedCollections() {
    const data = [];
    const res = await this.getCollections({
      type: ShowCollectionsType.Loaded,
    });
    if (res.data.length > 0) {
      for (const item of res.data) {
        const { id, name } = item;

        const count = this.count({ collection_name: name });
        data.push({
          id,
          collection_name: name,
          rowCount: count,
          ...item,
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
   * @returns {collection_name:string, index_descriptions: index_descriptions}[]
   */
  async getCollectionsIndexStatus() {
    const data = [];
    const res = await this.getCollections();
    if (res.data.length > 0) {
      for (const item of res.data) {
        const indexRes = await this.getIndexInfo({
          collection_name: item.name,
        });
        data.push({
          collection_name: item.name,
          index_descriptions: indexRes,
        });
      }
    }
    return data;
  }

  /**
   * Load sample data into collection
   */
  async importSample({
    collection_name,
    size,
    download,
    format,
  }: ImportSampleDto) {
    const collectionInfo = await this.describeCollection({ collection_name });
    const fields_data = genRows(
      collectionInfo.schema.fields,
      parseInt(size, 10),
      collectionInfo.schema.enable_dynamic_field
    );

    if (download) {
      const parser = new Parser({});
      const sampleFile =
        format === 'csv'
          ? parser.parse(fields_data)
          : JSON.stringify(fields_data);
      // If download is true, return the generated data directly
      return { sampleFile };
    } else {
      // Otherwise, insert the data into the collection
      return await this.insert({ collection_name, fields_data });
    }
  }

  async getCompactionState(data: GetCompactionStateReq) {
    const res = await this.milvusService.client.getCompactionState(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async getQuerySegmentInfo(data: GetQuerySegmentInfoReq) {
    const res = await this.milvusService.client.getQuerySegmentInfo(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async getPersistentSegmentInfo(data: GePersistentSegmentInfoReq) {
    const res = await this.milvusService.client.getPersistentSegmentInfo(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async compact(data: CompactReq) {
    const res = await this.milvusService.client.compact(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async hasCollection(data: HasCollectionReq) {
    const res = await this.milvusService.client.hasCollection(data);
    throwErrorFromSDK(res.status);
    return res;
  }
}
