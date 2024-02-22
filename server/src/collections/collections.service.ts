import {
  CreateCollectionReq,
  DescribeCollectionReq,
  DropCollectionReq,
  GetCollectionStatisticsReq,
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
  FieldSchema,
  GetLoadStateReq,
} from '@zilliz/milvus2-sdk-node';
import { Parser } from '@json2csv/plainjs';
import {
  throwErrorFromSDK,
  findKeyValue,
  genRows,
  ROW_COUNT,
  convertFieldSchemaToFieldType,
} from '../utils';
import { QueryDto, ImportSampleDto, GetReplicasDto } from './dto';
import { CollectionData } from '../types';
import { SchemaService } from '../schema/schema.service';
import { clientCache } from '../app';

export class CollectionsService {
  private schemaService: SchemaService;

  constructor() {
    this.schemaService = new SchemaService();
  }

  async getCollections(clientId: string, data?: ShowCollectionsReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.showCollections(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async createCollection(clientId: string, data: CreateCollectionReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.createCollection(data);
    throwErrorFromSDK(res);
    return res;
  }

  async describeCollection(clientId: string, data: DescribeCollectionReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.describeCollection(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async renameCollection(clientId: string, data: RenameCollectionReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.renameCollection(data);
    throwErrorFromSDK(res);
    return res;
  }

  async dropCollection(clientId: string, data: DropCollectionReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.dropCollection(data);
    throwErrorFromSDK(res);
    return res;
  }

  async loadCollection(clientId: string, data: LoadCollectionReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.loadCollection(data);
    throwErrorFromSDK(res);
    return res;
  }

  async releaseCollection(clientId: string, data: ReleaseLoadCollectionReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.releaseCollection(data);
    throwErrorFromSDK(res);
    return res;
  }

  async getCollectionStatistics(
    clientId: string,
    data: GetCollectionStatisticsReq
  ) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.getCollectionStatistics(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async getLoadState(clientId: string, data: GetLoadStateReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.getLoadState(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async count(clientId: string, data: CountReq) {
    const { milvusClient } = clientCache.get(clientId);
    let count = 0;
    try {
      const countRes = await milvusClient.count(data);
      count = countRes.data;
    } catch (error) {
      const collectionStatisticsRes = await this.getCollectionStatistics(
        clientId,
        data
      );
      count = collectionStatisticsRes.data.row_count;
    }
    return count;
  }

  async insert(clientId: string, data: InsertReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.insert(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async deleteEntities(clientId: string, data: DeleteEntitiesReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.deleteEntities(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async vectorSearch(clientId: string, data: SearchReq) {
    const { milvusClient } = clientCache.get(clientId);
    const now = Date.now();
    const res = await milvusClient.search(data);
    const after = Date.now();

    throwErrorFromSDK(res.status);
    Object.assign(res, { latency: after - now });
    return res;
  }

  async createAlias(clientId: string, data: CreateAliasReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.createAlias(data);
    throwErrorFromSDK(res);
    return res;
  }

  async alterAlias(clientId: string, data: AlterAliasReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.alterAlias(data);
    throwErrorFromSDK(res);
    return res;
  }

  async dropAlias(clientId: string, data: DropAliasReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.dropAlias(data);
    throwErrorFromSDK(res);
    return res;
  }

  async getReplicas(clientId: string, data: GetReplicasDto) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.getReplicas(data);
    return res;
  }

  async query(
    clientId: string,
    data: {
      collection_name: string;
    } & QueryDto
  ) {
    const { milvusClient } = clientCache.get(clientId);
    const now = Date.now();
    const res = await milvusClient.query(data);

    const after = Date.now();

    throwErrorFromSDK(res.status);
    Object.assign(res, { latency: after - now });
    return res;
  }

  /**
   * Get all collections meta data
   * @returns {id:string, collection_name:string, schema:Field[], autoID:boolean, rowCount: number, consistency_level:string}
   */
  async getAllCollections(
    clientId: string,
    collections?: {
      data: { name: string }[];
    }
  ): Promise<CollectionData[]> {
    const data: CollectionData[] = [];
    const res = collections || (await this.getCollections(clientId));
    const loadedCollections = await this.getCollections(clientId, {
      type: ShowCollectionsType.Loaded,
    });
    if (res.data.length > 0) {
      for (const item of res.data) {
        const { name } = item;

        // get collection schema and properties
        const collectionInfo = await this.describeCollection(clientId, {
          collection_name: name,
        });

        // get collection statistic data
        const collectionStatisticsRes = await this.getCollectionStatistics(
          clientId,
          {
            collection_name: name,
          }
        );

        // get index info for collections
        const indexRes = await this.schemaService.describeIndex(clientId, {
          collection_name: item.name,
        });

        // extract autoID
        const autoID = collectionInfo.schema.fields.find(
          v => v.is_primary_key === true
        )?.autoID;

        // if it is loaded
        const loadCollection = loadedCollections.data.find(
          v => v.name === name
        );

        // loading info
        const loadedPercentage = !loadCollection
          ? '-1'
          : loadCollection.loadedPercentage;

        // get replica info
        let replicas;
        try {
          replicas = loadCollection
            ? await this.getReplicas(clientId, {
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
          rowCount: Number(collectionStatisticsRes.data.row_count),
          id: collectionInfo.collectionID,
          loadedPercentage,
          createdTime: parseInt(collectionInfo.created_utc_timestamp, 10),
          index_descriptions: indexRes.index_descriptions,
          consistency_level: collectionInfo.consistency_level,
          replicas: replicas && replicas.replicas,
        });
      }
    }
    // add default sort - Descending order
    data.sort((a, b) => b.createdTime - a.createdTime);
    return data;
  }

  async getLoadedCollections(clientId: string) {
    const data = [];
    const res = await this.getCollections(clientId, {
      type: ShowCollectionsType.Loaded,
    });
    if (res.data.length > 0) {
      for (const item of res.data) {
        const { id, name } = item;

        const count = this.count(clientId, { collection_name: name });
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
  async getStatistics(clientId: string) {
    const data = {
      collectionCount: 0,
      totalData: 0,
    };
    const res = await this.getCollections(clientId);
    data.collectionCount = res.data.length;
    if (res.data.length > 0) {
      for (const item of res.data) {
        const collectionStatistics = await this.getCollectionStatistics(
          clientId,
          {
            collection_name: item.name,
          }
        );
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
  async getCollectionsIndexStatus(clientId: string) {
    const data = [];
    const res = await this.getCollections(clientId);
    if (res.data.length > 0) {
      for (const item of res.data) {
        const indexRes = await this.schemaService.describeIndex(clientId, {
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
  async importSample(
    clientId: string,
    { collection_name, size, download, format }: ImportSampleDto
  ) {
    const collectionInfo = await this.describeCollection(clientId, {
      collection_name,
    });
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
      return await this.insert(clientId, { collection_name, fields_data });
    }
  }

  async getCompactionState(clientId: string, data: GetCompactionStateReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.getCompactionState(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async getQuerySegmentInfo(clientId: string, data: GetQuerySegmentInfoReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.getQuerySegmentInfo(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async getPersistentSegmentInfo(
    clientId: string,
    data: GePersistentSegmentInfoReq
  ) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.getPersistentSegmentInfo(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async compact(clientId: string, data: CompactReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.compact(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async hasCollection(clientId: string, data: HasCollectionReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.hasCollection(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async duplicateCollection(clientId: string, data: RenameCollectionReq) {
    const collection: any = await this.describeCollection(clientId, {
      collection_name: data.collection_name,
    });

    const createCollectionParams: CreateCollectionReq = {
      collection_name: data.new_collection_name,
      fields: collection.schema.fields.map(convertFieldSchemaToFieldType),
      consistency_level: collection.consistency_level,
      enable_dynamic_field: !!collection.enable_dynamic_field,
    };

    if (
      collection.schema.fields.some((f: FieldSchema) => f.is_partition_key) &&
      collection.num_partitions
    ) {
      createCollectionParams.num_partitions = Number(collection.num_partitions);
    }

    return await this.createCollection(clientId, createCollectionParams);
  }

  async emptyCollection(clientId: string, data: HasCollectionReq) {
    const { milvusClient } = clientCache.get(clientId);
    const pkField = await milvusClient.getPkFieldName(data);
    const pkType = await milvusClient.getPkFieldType(data);

    const res = await milvusClient.deleteEntities({
      collection_name: data.collection_name,
      filter: pkType === 'Int64' ? `${pkField} >= 0` : `${pkField} != ''`,
    });

    return res;
  }
}
