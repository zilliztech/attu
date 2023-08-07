import { ChildrenStatusType } from '../components/status/Types';
import {
  CollectionView,
  DeleteEntitiesReq,
  InsertDataParam,
  LoadReplicaReq,
  Replica,
} from '../pages/collections/Types';
import { LoadSampleParam } from '../pages/dialogs/Types';
import { Field } from '@/pages/schema/Types';
import { VectorSearchParam } from '../types/SearchTypes';
import { QueryParam } from '@/pages/query/Types';
import { IndexState, ShowCollectionsType } from '../types/Milvus';
import { formatNumber } from '../utils/Common';
import BaseModel from './BaseModel';
import { FieldHttp } from './Field';
import dayjs from 'dayjs';
import { LOADING_STATE } from '@/consts';

export class CollectionHttp extends BaseModel implements CollectionView {
  private aliases!: string[];
  private autoID!: string;
  private collection_name!: string;
  private description!: string;
  private consistency_level!: string;
  private rowCount!: string;
  private index_status!: string;
  private id!: string;
  private loadedPercentage!: string;
  private createdTime!: string;
  private schema!: {
    fields: Field[];
  };
  private replicas!: Replica[];

  static COLLECTIONS_URL = '/collections';
  static COLLECTIONS_INDEX_STATUS_URL = '/collections/indexes/status';
  static COLLECTIONS_STATISTICS_URL = '/collections/statistics';

  constructor(props: CollectionView) {
    super(props);
    Object.assign(this, props);
  }

  static getCollections(data?: {
    type: ShowCollectionsType;
  }): Promise<CollectionHttp[]> {
    return super.findAll({ path: this.COLLECTIONS_URL, params: data || {} });
  }

  static getCollection(name: string) {
    return super.search({
      path: `${this.COLLECTIONS_URL}/${name}`,
      params: {},
    });
  }

  static createCollection(data: any) {
    return super.create({ path: this.COLLECTIONS_URL, data });
  }

  static getCollectionsIndexState(): Promise<CollectionHttp[]> {
    return super.findAll({
      path: this.COLLECTIONS_INDEX_STATUS_URL,
      params: {},
    });
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

  static insertData(collectionName: string, param: InsertDataParam) {
    return super.create({
      path: `${this.COLLECTIONS_URL}/${collectionName}/insert`,
      data: param,
    });
  }

  static importSample(collectionName: string, param: LoadSampleParam) {
    return super.create({
      path: `${this.COLLECTIONS_URL}/${collectionName}/importSample`,
      data: param,
    });
  }

  static deleteEntities(collectionName: string, param: DeleteEntitiesReq) {
    return super.update({
      path: `${this.COLLECTIONS_URL}/${collectionName}/entities`,
      data: param,
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

  get _autoId() {
    return this.autoID;
  }

  get _aliases() {
    return this.aliases;
  }

  get _desc() {
    return this.description || '--';
  }

  get _id() {
    return this.id;
  }

  get _name() {
    return this.collection_name;
  }

  get _rowCount() {
    return formatNumber(Number(this.rowCount));
  }

  get _loadedPercentage() {
    return this.loadedPercentage;
  }
  // load status
  get _status() {
    // If not load, insight server will return '-1'. Otherwise milvus will return percentage
    return this._loadedPercentage === '-1'
      ? LOADING_STATE.UNLOADED
      : this._loadedPercentage === '100'
      ? LOADING_STATE.LOADED
      : LOADING_STATE.LOADING;
    // return LOADING_STATE.LOADING
  }

  get _consistencyLevel() {
    return this.consistency_level;
  }

  get _fields() {
    return this.schema.fields.map(f => new FieldHttp(f));
  }

  get _indexState() {
    switch (this.index_status) {
      case IndexState.InProgress:
        return ChildrenStatusType.CREATING;
      case IndexState.Failed:
        return ChildrenStatusType.ERROR;
      default:
        return ChildrenStatusType.FINISH;
    }
  }

  // Befor milvus-2.0-rc3  will return '0'.
  // If milvus is stable, we can remote this condition
  get _createdTime(): string {
    return this.createdTime && this.createdTime !== '0'
      ? dayjs(Number(this.createdTime)).format('YYYY-MM-DD HH:mm:ss')
      : '';
  }

  get _replicas(): Replica[] {
    return this.replicas;
  }
}
