import dayjs from 'dayjs';
import { LoadReplicaReq } from '@/pages/collections/Types';
import { VectorSearchParam } from '@/types/SearchTypes';
import { QueryParam } from '@/pages/query/Types';
import { formatNumber } from '@/utils/Common';
import BaseModel from './BaseModel';
import { LOADING_STATE } from '@/consts';
import {
  IndexDescription,
  ShowCollectionsType,
  CollectionSchema,
  ReplicaInfo,
  CollectionData,
} from '@server/types';
import { MilvusIndex, FieldHttp } from '@/http';

export class Collection extends BaseModel implements CollectionData {
  public aliases: string[] = [];
  public autoID!: boolean;
  public collection_name!: string;
  public description: string = '';
  public consistency_level!: string;
  public rowCount!: string;
  public id!: string;
  public loadedPercentage!: string;
  public createdTime!: number;
  public index_descriptions!: IndexDescription[];
  public schema!: CollectionSchema;
  public replicas!: ReplicaInfo[];

  static COLLECTIONS_URL = '/collections';
  static COLLECTIONS_STATISTICS_URL = '/collections/statistics';

  constructor(props: Collection) {
    super(props);
    Object.assign(this, props);
  }

  static getCollections(data?: {
    type: ShowCollectionsType;
  }): Promise<Collection[]> {
    return super.findAll({ path: this.COLLECTIONS_URL, params: data || {} });
  }

  static getCollectionWithIndexInfo(name: string) {
    return super.search<Collection>({
      path: `${this.COLLECTIONS_URL}/${name}`,
      params: {},
    });
  }

  static getCollectionInfo(collectionName: string) {
    return super.search<Collection>({
      path: `${this.COLLECTIONS_URL}/${collectionName}/info`,
      params: {},
    });
  }

  static createCollection(data: any) {
    return super.create({ path: this.COLLECTIONS_URL, data });
  }

  static deleteCollection(collectionName: string) {
    return super.delete({ path: `${this.COLLECTIONS_URL}/${collectionName}` });
  }

  static loadCollection(collectionName: string, param?: LoadReplicaReq) {
    return super.update({
      path: `${this.COLLECTIONS_URL}/${collectionName}/load`,
      data: param,
    });
  }

  static releaseCollection(collectionName: string) {
    return super.update({
      path: `${this.COLLECTIONS_URL}/${collectionName}/release`,
    });
  }

  static renameCollection(
    collectionName: string,
    params: { new_collection_name: string }
  ) {
    return super.create({
      path: `${this.COLLECTIONS_URL}/${collectionName}`,
      data: params,
    });
  }

  static getStatistics() {
    return super.search({ path: this.COLLECTIONS_STATISTICS_URL, params: {} });
  }

  static count(collectionName: string) {
    return super.search<Collection>({
      path: `${this.COLLECTIONS_URL}/${collectionName}/count`,
      params: {},
    });
  }

  static vectorSearchData(collectionName: string, params: VectorSearchParam) {
    return super.query({
      path: `${this.COLLECTIONS_URL}/${collectionName}/search`,
      data: params,
    });
  }

  static createAlias(collectionName: string, params: { alias: string }) {
    return super.create({
      path: `${this.COLLECTIONS_URL}/${collectionName}/alias`,
      data: params,
    });
  }

  static dropAlias(collectionName: string, params: { alias: string }) {
    return super.delete({
      path: `${this.COLLECTIONS_URL}/${collectionName}/alias/${params.alias}`,
    });
  }

  static queryData(collectionName: string, params: QueryParam) {
    return super.query({
      path: `${this.COLLECTIONS_URL}/${collectionName}/query`,
      data: params,
    });
  }

  get desc() {
    return this.description || '--';
  }

  get collectionName() {
    return this.collection_name;
  }

  get entityCount() {
    return formatNumber(Number(this.rowCount));
  }

  // load status
  get status() {
    // If not load, insight server will return '-1'. Otherwise milvus will return percentage
    return this.loadedPercentage === '-1'
      ? LOADING_STATE.UNLOADED
      : this.loadedPercentage === '100'
      ? LOADING_STATE.LOADED
      : LOADING_STATE.LOADING;
    // return LOADING_STATE.LOADING
  }

  get fields() {
    return this.schema.fields.map(f => new FieldHttp(f));
  }

  get indexes() {
    return this.index_descriptions.map(index => new MilvusIndex(index));
  }

  // Befor milvus-2.0-rc3  will return '0'.
  // If milvus is stable, we can remote this condition
  get createdAt(): string {
    return this.createdTime && this.createdTime !== 0
      ? dayjs(Number(this.createdTime)).format('YYYY-MM-DD HH:mm:ss')
      : '';
  }

  get replicasInfo(): ReplicaInfo[] {
    return this.replicas || [];
  }

  get enableDynamicField(): boolean {
    return this.schema && this.schema.enable_dynamic_field;
  }

  get fieldWithIndexInfo() {
    let fields: FieldHttp[] = [];
    for (const schema of this.fields) {
      let field: FieldHttp = schema;
      const index = this.indexes.find(i => i.field_name === schema.name);
      field.indexParameterPairs = index?.indexParameterPairs || [];
      field.indexType = index?.indexType || '';
      field.indexName = index?.index_name || '';

      fields.push(field);
    }
    return fields;
  }
}
