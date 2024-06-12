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
  GetLoadStateReq,
  CollectionData,
  CreateIndexReq,
  DescribeIndexReq,
  DropIndexReq,
  AlterCollectionReq,
  DataType,
} from '@zilliz/milvus2-sdk-node';
import { Parser } from '@json2csv/plainjs';
import {
  throwErrorFromSDK,
  findKeyValue,
  getKeyValueListFromJsonString,
  genRows,
  ROW_COUNT,
  convertFieldSchemaToFieldType,
  LOADING_STATE,
  DYNAMIC_FIELD,
  SimpleQueue,
  MIN_INT64,
  VectorTypes,
} from '../utils';
import { QueryDto, ImportSampleDto, GetReplicasDto } from './dto';
import {
  CollectionObject,
  CollectionLazyObject,
  FieldObject,
  IndexObject,
  DescribeCollectionRes,
  CountObject,
  StatisticsObject,
  CollectionFullObject,
  DescribeIndexRes,
} from '../types';
import { clientCache } from '../app';
import { clients } from '../socket';
import { WS_EVENTS } from '../utils';

export class CollectionsService {
  async showCollections(clientId: string, data?: ShowCollectionsReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.showCollections(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async createCollection(clientId: string, data: CreateCollectionReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.createCollection(data);
    const newCollection = (await this.getAllCollections(clientId, [
      data.collection_name,
    ])) as CollectionFullObject[];

    throwErrorFromSDK(res);
    return newCollection[0];
  }

  async describeCollection(clientId: string, data: DescribeCollectionReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = (await milvusClient.describeCollection(
      data
    )) as DescribeCollectionRes;

    // get index info for collections
    const indexRes = await this.describeIndex(clientId, {
      collection_name: data.collection_name,
    });

    throwErrorFromSDK(res.status);

    const vectorFields: FieldObject[] = [];
    const scalarFields: FieldObject[] = [];

    // append index info to each field
    res.schema.fields.forEach((field: FieldObject) => {
      // add index
      field.index = indexRes.index_descriptions.find(
        index => index.field_name === field.name
      ) as IndexObject;
      // add dimension
      field.dimension =
        Number(field.type_params.find(item => item.key === 'dim')?.value) || -1;
      // add max capacity
      field.maxCapacity =
        Number(
          field.type_params.find(item => item.key === 'max_capacity')?.value
        ) || -1;
      // add max length
      field.maxLength =
        Number(
          field.type_params.find(item => item.key === 'max_length')?.value
        ) || -1;

      // classify fields
      if (VectorTypes.includes(field.data_type)) {
        vectorFields.push(field);
      } else {
        scalarFields.push(field);
      }

      if (field.is_primary_key) {
        res.schema.primaryField = field;
      }
    });

    // add extra data to schema
    res.schema.hasVectorIndex = vectorFields.every(v => v.index);
    res.schema.scalarFields = scalarFields;
    res.schema.vectorFields = vectorFields;
    res.schema.dynamicFields = res.schema.enable_dynamic_field
      ? [
          {
            name: DYNAMIC_FIELD,
            data_type: 'JSON',
            type_params: [],
            index: undefined,
            description: '',
            index_params: [],
            dimension: -1,
            maxCapacity: -1,
            maxLength: -1,
            autoID: false,
            fieldID: '',
            state: '',
            dataType: DataType.JSON,
          },
        ]
      : [];

    return res;
  }

  async renameCollection(clientId: string, data: RenameCollectionReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.renameCollection(data);
    throwErrorFromSDK(res);

    const newCollection = (await this.getAllCollections(clientId, [
      data.new_collection_name,
    ])) as CollectionFullObject[];

    return newCollection[0];
  }

  async alterCollection(clientId: string, data: AlterCollectionReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.alterCollection(data);
    throwErrorFromSDK(res);

    const newCollection = (await this.getAllCollections(clientId, [
      data.collection_name,
    ])) as CollectionFullObject[];

    return newCollection[0];
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

    return data.collection_name;
  }

  async releaseCollection(clientId: string, data: ReleaseLoadCollectionReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.releaseCollection(data);
    throwErrorFromSDK(res);

    // emit update to client
    this.updateCollectionsDetails(clientId, [data.collection_name]);

    return data.collection_name;
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
    return { rowCount: Number(count) } as CountObject;
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

    const newCollection = (await this.getAllCollections(clientId, [
      data.collection_name,
    ])) as CollectionFullObject[];

    return newCollection[0];
  }

  async alterAlias(clientId: string, data: AlterAliasReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.alterAlias(data);
    throwErrorFromSDK(res);
    return res;
  }

  async dropAlias(
    clientId: string,
    collection_name: string,
    data: DropAliasReq
  ) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.dropAlias(data);
    throwErrorFromSDK(res);

    const newCollection = (await this.getAllCollections(clientId, [
      collection_name,
    ])) as CollectionFullObject[];

    return newCollection[0];
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

  // get single collection details
  async getCollection(
    clientId: string,
    collection: CollectionData,
    loadCollection: CollectionData,
    lazy: boolean = false
  ) {
    const { collectionsQueue } = clientCache.get(clientId);
    if (lazy) {
      // add to lazy queue
      collectionsQueue.enqueue(collection.name);

      // return lazy object
      return {
        id: collection.id,
        collection_name: collection.name,
        createdTime: Number(collection.timestamp),
        schema: undefined,
        rowCount: undefined,
        aliases: undefined,
        description: undefined,
        autoID: undefined,
        loadedPercentage: undefined,
        consistency_level: undefined,
        replicas: undefined,
        loaded: undefined,
      } as CollectionLazyObject;
    }
    // get collection schema and properties
    const collectionInfo = await this.describeCollection(clientId, {
      collection_name: collection.name,
    });

    // get collection statistic data
    let count: number;

    try {
      const res = await this.count(clientId, {
        collection_name: collection.name,
      });
      count = res.rowCount;
    } catch (e) {
      console.log('ignore getCollectionStatistics');
    }

    // extract autoID
    const autoID = collectionInfo.schema.fields.find(
      v => v.is_primary_key === true
    )?.autoID;

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

    // loading info
    const loadedPercentage = !loadCollection
      ? -1
      : Number(loadCollection.loadedPercentage);

    const status =
      loadedPercentage === -1
        ? LOADING_STATE.UNLOADED
        : loadedPercentage === 100
          ? LOADING_STATE.LOADED
          : LOADING_STATE.LOADING;

    return {
      collection_name: collection.name,
      schema: collectionInfo.schema,
      rowCount: Number(count || 0),
      createdTime: parseInt(collectionInfo.created_utc_timestamp, 10),
      aliases: collectionInfo.aliases,
      description: collectionInfo.schema.description,
      autoID,
      id: collectionInfo.collectionID,
      loadedPercentage,
      consistency_level: collectionInfo.consistency_level,
      replicas: replicas && replicas.replicas,
      loaded: status === LOADING_STATE.LOADED,
      status,
    };
  }

  // get all collections details
  async getAllCollections(
    clientId: string,
    collectionName: string[] = []
  ): Promise<CollectionObject[]> {
    const cache = clientCache.get(clientId);

    // clear collectionsQueue
    if (collectionName.length === 0) {
      cache.collectionsQueue.stop();
      cache.collectionsQueue = new SimpleQueue<string>();
    }

    // get all collections(name, timestamp, id)
    const allCollections = await this.showCollections(clientId);
    // get all loaded collection
    const loadedCollections = await this.showCollections(clientId, {
      type: ShowCollectionsType.Loaded,
    });

    // data container
    const data: CollectionObject[] = [];

    // get target collections details
    const targetCollections = allCollections.data.filter(
      d => collectionName.indexOf(d.name) !== -1
    );

    const targets =
      targetCollections.length > 0 ? targetCollections : allCollections.data;

    // get all collection details
    for (let i = 0; i < targets.length; i++) {
      const collection = targets[i];
      const loadedCollection = loadedCollections.data.find(
        v => v.name === collection.name
      );

      const notLazy = i <= 5; // lazy is true, only load full details for the first 10 collections

      data.push(
        await this.getCollection(
          clientId,
          collection,
          loadedCollection,
          !notLazy
        )
      );
    }

    // start the queue
    if (cache.collectionsQueue.size() > 0) {
      cache.collectionsQueue.executeNext(async (collectionsToGet, q) => {
        // if the queue is obseleted, return
        if (q.isObseleted) {
          return;
        }
        await this.updateCollectionsDetails(clientId, collectionsToGet);
      }, 5);
    }

    // sort data by loadedPercentage and has index or not, then createdTime.
    data.sort((a, b) => {
      if (a.loadedPercentage === b.loadedPercentage && a.schema && b.schema) {
        if (a.schema.hasVectorIndex === b.schema.hasVectorIndex) {
          return b.createdTime - a.createdTime;
        }
        return a.schema.hasVectorIndex ? -1 : 1;
      }
      return (b.loadedPercentage || 0) - (a.loadedPercentage || 0);
    });

    // return data
    return data;
  }

  // update collections details
  // send new info to the client
  async updateCollectionsDetails(clientId: string, collections: string[]) {
    try {
      // get current socket
      const socketClient = clients.get(clientId);
      // get collections
      const res = await this.getAllCollections(clientId, collections);

      // emit event to current client
      if (socketClient) {
        socketClient.emit(WS_EVENTS.COLLECTION_UPDATE, res);
      }
    } catch (e) {
      console.log('ignore queue error');
    }
  }

  async getLoadedCollections(clientId: string) {
    const data = [];
    const res = await this.showCollections(clientId, {
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
    } as StatisticsObject;
    const res = await this.showCollections(clientId);
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
    const collection = await this.describeCollection(clientId, {
      collection_name: data.collection_name,
    });

    const createCollectionParams: CreateCollectionReq = {
      collection_name: data.new_collection_name,
      fields: collection.schema.fields.map(convertFieldSchemaToFieldType),
      consistency_level: collection.consistency_level as any,
      enable_dynamic_field: !!collection.schema.enable_dynamic_field,
    };

    if (
      collection.schema.fields.some(f => f.is_partition_key) &&
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
      filter:
        pkType === 'Int64' ? `${pkField} >= ${MIN_INT64}` : `${pkField} != ''`,
    });

    return res;
  }

  async createIndex(clientId: string, data: CreateIndexReq) {
    const { milvusClient, indexCache, database } = clientCache.get(clientId);
    const res = await milvusClient.createIndex(data);
    throwErrorFromSDK(res);
    const key = `${database}/${data.collection_name}`;
    // clear cache;
    indexCache.delete(key);

    // fetch new collections
    const newCollection = (await this.getAllCollections(clientId, [
      data.collection_name,
    ])) as CollectionFullObject[];

    throwErrorFromSDK(res);
    return newCollection[0];
  }

  /**
   * This function is used to describe an index in Milvus.
   * It first checks if the index description is cached, if so, it returns the cached value.
   * If not, it calls the Milvus SDK's describeIndex function to get the index description.
   * If the index is finished building, it caches the index description for future use.
   * If the index is not finished building, it deletes any cached value for this index.
   * @param data - The request data for describing an index. It contains the collection name.
   * @returns - The response from the Milvus SDK's describeIndex function or the cached index description.
   */
  async describeIndex(clientId: string, data: DescribeIndexReq) {
    const { milvusClient, indexCache, database } = clientCache.get(clientId);

    // Get the collection name from the request data
    const key = `${database}/${data.collection_name}`;

    // Try to get the index description from the cache
    const value = indexCache.get(key);

    // If the index description is in the cache, return it
    if (value) {
      return value as DescribeIndexRes;
    } else {
      // If the index description is not in the cache, call the Milvus SDK's describeIndex function
      const res = (await milvusClient.describeIndex(data)) as DescribeIndexRes;

      res.index_descriptions.map(index => {
        // get indexType
        index.indexType = (index.params.find(p => p.key === 'index_type')
          ?.value || '') as string;
        // get metricType
        const metricTypePair =
          index.params.filter(v => v.key === 'metric_type') || [];
        index.metricType = findKeyValue(
          metricTypePair,
          'metric_type'
        ) as string;
        // get index parameter pairs
        const paramsJSONstring = findKeyValue(index.params, 'params'); // params is a json string
        const params =
          (paramsJSONstring &&
            getKeyValueListFromJsonString(paramsJSONstring as string)) ||
          [];
        index.indexParameterPairs = [...metricTypePair, ...params];
      });

      // Return the response from the Milvus SDK's describeIndex function
      return res;
    }
  }

  async dropIndex(clientId: string, data: DropIndexReq) {
    const { milvusClient, indexCache, database } = clientCache.get(clientId);
    const res = await milvusClient.dropIndex(data);
    throwErrorFromSDK(res);

    const key = `${database}/${data.collection_name}`;

    // clear cache;
    indexCache.delete(key);
    // fetch new collections
    const newCollection = (await this.getAllCollections(clientId, [
      data.collection_name,
    ])) as CollectionFullObject[];

    return newCollection[0];
  }

  async clearCache(clientId: string) {
    const { indexCache } = clientCache.get(clientId);
    return indexCache.clear();
  }
}
