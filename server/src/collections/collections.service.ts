import {
  CreateCollectionReq,
  DescribeCollectionReq,
  DropCollectionReq,
  GetCollectionStatisticsReq,
  InsertReq,
  LoadCollectionReq,
  ReleaseLoadCollectionReq,
  RenameCollectionReq,
  AlterAliasReq,
  CreateAliasReq,
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
  HybridSearchReq,
  SearchSimpleReq,
  LoadState,
  AlterCollectionFieldPropertiesReq,
  AlterIndexReq,
  ErrorCode,
} from '@zilliz/milvus2-sdk-node';
import { Parser } from '@json2csv/plainjs';
import {
  findKeyValue,
  getKeyValueListFromJsonString,
  genRows,
  ROW_COUNT,
  convertFieldSchemaToFieldType,
  LOADING_STATE,
  DYNAMIC_FIELD,
  MIN_INT64,
  VectorTypes,
  cloneObj,
} from '../utils';
import { QueryDto, ImportSampleDto } from './dto';
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
    return res;
  }

  async createCollection(clientId: string, data: CreateCollectionReq) {
    const { milvusClient } = clientCache.get(clientId);
    return await milvusClient.createCollection(data);
  }

  async describeUnformattedCollection(
    clientId: string,
    collection_name: string,
    db_name?: string
  ) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.describeCollection({
      collection_name,
      db_name,
    });
    return res;
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

    const vectorFields: FieldObject[] = [];
    const scalarFields: FieldObject[] = [];
    const functionFields: FieldObject[] = [];

    // assign function to field
    const fieldMap = new Map(
      res.schema.fields.map(field => [field.name, field])
    );
    res.schema.functions.forEach(fn => {
      const assignFunction = (fieldName: string) => {
        const field = fieldMap.get(fieldName);
        if (field) {
          field.function = fn;
        }
      };

      fn.output_field_names.forEach(assignFunction);
      fn.input_field_names.forEach(assignFunction);
    });

    // get function input fields
    const inputFieldNames = res.schema.functions.reduce((acc, cur) => {
      return acc.concat(cur.input_field_names);
    }, []);

    // append index info to each field
    res.schema.fields.forEach((field: FieldObject) => {
      // add index
      field.index = indexRes.index_descriptions.find(
        index => index.field_name === field.name
      ) as IndexObject;
      // add dimension
      field.dimension = Number(field.dim) || -1;
      // add max capacity
      field.maxCapacity = Number(field.max_capacity) || -1;
      // add max length
      field.maxLength = Number(field.max_length) || -1;

      // classify fields
      if (VectorTypes.includes(field.data_type)) {
        vectorFields.push(field);
      } else {
        scalarFields.push(field);
      }

      if (field.is_primary_key) {
        res.schema.primaryField = field;
      }

      // add functionFields if field name included in inputFieldNames
      if (inputFieldNames.includes(field.name)) {
        functionFields.push(field);
      }
    });

    // add extra data to schema
    res.schema.hasVectorIndex = vectorFields.every(v => v.index);
    res.schema.enablePartitionKey = res.schema.fields.some(
      v => v.is_partition_key
    );
    res.schema.scalarFields = scalarFields;
    res.schema.vectorFields = vectorFields;
    res.schema.functionFields = functionFields;
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
            nullable: false,
            default_value: null,
            dataType: DataType.JSON,
            is_function_output: false,
            is_primary_key: false,
          },
        ]
      : [];

    if (res.schema.enable_dynamic_field) {
      res.schema.fields.push(res.schema.dynamicFields[0]);
    }

    return res;
  }

  async renameCollection(clientId: string, data: RenameCollectionReq) {
    const { milvusClient } = clientCache.get(clientId);
    return await milvusClient.renameCollection(data);
  }

  async alterCollectionProperties(clientId: string, data: AlterCollectionReq) {
    const { milvusClient } = clientCache.get(clientId);
    return await milvusClient.alterCollectionProperties(data);
  }

  async alterCollectionFieldProperties(
    clientId: string,
    data: AlterCollectionFieldPropertiesReq
  ) {
    const { milvusClient } = clientCache.get(clientId);

    return await milvusClient.alterCollectionFieldProperties(data);
  }

  async alterIndex(clientId: string, data: AlterIndexReq) {
    const { milvusClient } = clientCache.get(clientId);
    return await milvusClient.alterIndexProperties(data);
  }

  async dropCollection(clientId: string, data: DropCollectionReq) {
    const { milvusClient } = clientCache.get(clientId);
    return await milvusClient.dropCollection(data);
  }

  async loadCollection(clientId: string, data: LoadCollectionReq) {
    const { milvusClient } = clientCache.get(clientId);
    return await milvusClient.loadCollection(data);
  }

  async loadCollectionAsync(clientId: string, data: LoadCollectionReq) {
    const { milvusClient } = clientCache.get(clientId);
    return await milvusClient.loadCollectionAsync(data);
  }

  async releaseCollection(clientId: string, data: ReleaseLoadCollectionReq) {
    const { milvusClient } = clientCache.get(clientId);
    await milvusClient.releaseCollection(data);

    // emit update to client
    this.updateCollectionsDetails(
      clientId,
      [data.collection_name],
      data.db_name
    );

    return data.collection_name;
  }

  async getCollectionStatistics(
    clientId: string,
    data: GetCollectionStatisticsReq
  ) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.getCollectionStatistics(data);
    return res;
  }

  async getLoadState(clientId: string, data: GetLoadStateReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.getLoadState(data);
    return res;
  }

  async count(clientId: string, data: CountReq) {
    const { milvusClient } = clientCache.get(clientId);
    let count = 0;
    try {
      // check if the collection is loaded
      const loadStateRes = await milvusClient.getLoadState(data);

      if (loadStateRes.state === LoadState.LoadStateLoaded) {
        const countRes = await milvusClient.count(data);
        count = countRes.data;
      } else {
        const collectionStatisticsRes = await this.getCollectionStatistics(
          clientId,
          data
        );
        count = collectionStatisticsRes.data.row_count;
      }
    } catch (error) {
      console.log('ignore count error');
    }

    return { rowCount: Number(count) } as CountObject;
  }

  async insert(clientId: string, data: InsertReq) {
    const { milvusClient } = clientCache.get(clientId);
    const BATCH_SIZE = 1000;
    const fields_data = data.fields_data || data.data;

    // If data size is less than or equal to batch size, insert directly
    if (!fields_data || fields_data.length <= BATCH_SIZE) {
      const res = await milvusClient.insert(data);
      return res;
    }

    // Handle insertion in batches
    const results = [];
    for (let i = 0; i < fields_data.length; i += BATCH_SIZE) {
      const batchData = fields_data.slice(i, i + BATCH_SIZE);
      // Create a new request with only the necessary fields
      const batchRequest = { ...data, fields_data: batchData } as InsertReq;
      const result = await milvusClient.insert(batchRequest);

      if (result.status.error_code !== ErrorCode.SUCCESS) {
        throw new Error(result.status.reason);
      }
      results.push(result);
    }

    return results[0];
  }

  async upsert(clientId: string, data: InsertReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.upsert(data);
    return res;
  }

  async deleteEntities(clientId: string, data: DeleteEntitiesReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.deleteEntities(data);
    return res;
  }

  async vectorSearch(
    clientId: string,
    data: HybridSearchReq | SearchSimpleReq
  ) {
    const { milvusClient } = clientCache.get(clientId);
    const now = Date.now();
    const searchParams = data as HybridSearchReq;
    const isHybrid =
      Array.isArray(searchParams.data) && searchParams.data.length > 1;
    const singleSearchParams = cloneObj(data) as SearchSimpleReq;

    // for 2.3.x milvus
    if (searchParams.data && searchParams.data.length === 1) {
      delete singleSearchParams.data;
      delete singleSearchParams.params;

      if (Object.keys(searchParams.data[0].params).length > 0) {
        singleSearchParams.params = searchParams.data[0].params;
      }
      singleSearchParams.data = searchParams.data[0].data;
      singleSearchParams.anns_field = searchParams.data[0].anns_field;
      singleSearchParams.group_by_field = searchParams.group_by_field;
    }

    const res = await milvusClient.search(
      isHybrid ? searchParams : singleSearchParams
    );
    const after = Date.now();

    Object.assign(res, { latency: after - now });
    return res;
  }

  async createAlias(clientId: string, data: CreateAliasReq) {
    const { milvusClient } = clientCache.get(clientId);
    return await milvusClient.createAlias(data);
  }

  async alterAlias(clientId: string, data: AlterAliasReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.alterAlias(data);
    return res;
  }

  async dropAlias(clientId: string, collection_name: string, data: any) {
    const { milvusClient } = clientCache.get(clientId);
    await milvusClient.dropAlias(data);

    const newCollection = (await this.getAllCollections(
      clientId,
      [collection_name],
      data.db_name
    )) as CollectionFullObject[];

    return newCollection[0];
  }

  async getReplicas(clientId: string, data: any) {
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

    Object.assign(res, { latency: after - now });
    return res;
  }

  // get single collection details
  async getCollection(
    clientId: string,
    collection: CollectionData,
    loadCollection: CollectionData,
    lazy: boolean = false,
    database?: string
  ) {
    if (lazy) {
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
        db_name: database,
      } as CollectionLazyObject;
    }
    // get collection schema and properties
    const collectionInfo = await this.describeCollection(clientId, {
      collection_name: collection.name,
      db_name: database,
    });

    // get collection statistic data
    let count: number;

    try {
      const res = await this.count(clientId, {
        collection_name: collection.name,
        db_name: database,
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
            db_name: database,
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
      replicas: (replicas && replicas.replicas) || [],
      loaded: status === LOADING_STATE.LOADED,
      status,
      properties: collectionInfo.properties,
      db_name: database,
    };
  }

  // get all collections details
  async getAllCollections(
    clientId: string,
    collections: string[] = [],
    database?: string
  ): Promise<CollectionObject[]> {
    try {
      // get all collections(name, timestamp, id)
      const allCollections = await this.showCollections(clientId, {
        db_name: database,
      });
      // get all loaded collection
      const loadedCollections = await this.showCollections(clientId, {
        type: ShowCollectionsType.Loaded,
        db_name: database,
      });

      // data container
      const data: CollectionObject[] = [];

      // get target collections details
      const targetCollections = allCollections.data.filter(
        d => collections.indexOf(d.name) !== -1
      );

      const targets =
        targetCollections.length > 0 ? targetCollections : allCollections.data;

      // sort targets by name
      targets.sort((a, b) => a.name.localeCompare(b.name));

      // get all collection details
      for (let i = 0; i < targets.length; i++) {
        const collection = targets[i];
        const loadedCollection = loadedCollections.data.find(
          v => v.name === collection.name
        );

        data.push(
          await this.getCollection(
            clientId,
            collection,
            loadedCollection,
            collections.length === 0, // if no collection is specified, load all collections without detail
            database
          )
        );
      }

      // return data
      return data;
    } catch (error) {
      // if error occurs, return empty array, for example, when the client is disconnected
      return [];
    }
  }

  // update collections details
  // send new info to the client
  async updateCollectionsDetails(
    clientId: string,
    collections: string[],
    database: string
  ) {
    try {
      // get current socket
      const socketClient = clients.get(clientId);
      // get collections
      const res = await this.getAllCollections(clientId, collections, database);

      // emit event to current client
      if (socketClient) {
        socketClient.emit(WS_EVENTS.COLLECTION_UPDATE, { collections: res });
      }
    } catch (e) {
      console.log('ignore queue error');
    }
  }

  async getLoadedCollections(clientId: string, db_name?: string) {
    const data = [];
    const res = await this.showCollections(clientId, {
      type: ShowCollectionsType.Loaded,
      db_name,
    });
    if (res.data.length > 0) {
      for (const item of res.data) {
        const { id, name } = item;

        const count = this.count(clientId, { collection_name: name, db_name });
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
  async getStatistics(clientId: string, db_name?: string) {
    const data = {
      collectionCount: 0,
      totalData: 0,
    } as StatisticsObject;
    const res = await this.showCollections(clientId, { db_name });
    data.collectionCount = res.data.length;
    if (res.data.length > 0) {
      for (const item of res.data) {
        const collectionStatistics = await this.getCollectionStatistics(
          clientId,
          {
            collection_name: item.name,
            db_name,
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
    { collection_name, size, download, format, db_name }: ImportSampleDto
  ) {
    const collectionInfo = await this.describeCollection(clientId, {
      collection_name,
      db_name,
    });

    const totalSize = parseInt(size, 10);
    const fields_data = genRows(
      collectionInfo.schema.fields,
      totalSize,
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
      // Insert all data at once, batch handling is now in insert method
      return await this.insert(clientId, {
        collection_name,
        fields_data,
        db_name,
      });
    }
  }

  async getCompactionState(clientId: string, data: GetCompactionStateReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.getCompactionState(data);
    return res;
  }

  async getQuerySegmentInfo(clientId: string, data: GetQuerySegmentInfoReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.getQuerySegmentInfo(data);
    return res;
  }

  async getPersistentSegmentInfo(
    clientId: string,
    data: GePersistentSegmentInfoReq
  ) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.getPersistentSegmentInfo(data);
    return res;
  }

  async compact(clientId: string, data: CompactReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.compact(data);
    return res;
  }

  async hasCollection(clientId: string, data: HasCollectionReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.hasCollection(data);
    return res;
  }

  async duplicateCollection(clientId: string, data: RenameCollectionReq) {
    const collection = await this.describeCollection(clientId, {
      collection_name: data.collection_name,
      db_name: data.db_name,
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
      db_name: data.db_name,
    });

    return res;
  }

  async createIndex(clientId: string, data: CreateIndexReq) {
    const { milvusClient } = clientCache.get(clientId);
    return await milvusClient.createIndex(data);
  }

  async describeIndex(clientId: string, data: DescribeIndexReq) {
    const { milvusClient } = clientCache.get(clientId);

    // If the index description is not in the cache, call the Milvus SDK's describeIndex function
    const res = (await milvusClient.describeIndex(data)) as DescribeIndexRes;

    res.index_descriptions.map(index => {
      // get indexType
      index.indexType = (index.params.find(p => p.key === 'index_type')
        ?.value || '') as string;
      // get metricType
      const metricTypePair =
        index.params.filter(v => v.key === 'metric_type') || [];
      index.metricType = findKeyValue(metricTypePair, 'metric_type') as string;

      // copy index.params withouth index_type and metric_type and params
      const indexParams = index.params.filter(
        p =>
          p.key !== 'index_type' &&
          p.key !== 'metric_type' &&
          p.key !== 'params'
      );
      // get index parameter pairs
      const paramsJSONstring = findKeyValue(index.params, 'params'); // params is a json string
      const params =
        (paramsJSONstring &&
          getKeyValueListFromJsonString(paramsJSONstring as string)) ||
        [];

      index.indexParameterPairs = [...indexParams, ...params];
    });

    // Return the response from the Milvus SDK's describeIndex function
    return res;
  }

  async dropIndex(clientId: string, data: DropIndexReq) {
    const { milvusClient } = clientCache.get(clientId);
    return await milvusClient.dropIndex(data);
  }
}
