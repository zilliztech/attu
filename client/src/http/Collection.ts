import { ChildrenStatusType, StatusEnum } from '../components/status/Types';
import { CollectionView, InsertDataParam } from '../pages/collections/Types';
import { Field } from '../pages/schema/Types';
import { IndexState, ShowCollectionsType } from '../types/Milvus';
import { formatNumber } from '../utils/Common';
import BaseModel from './BaseModel';
import { FieldHttp } from './Field';

export class CollectionHttp extends BaseModel implements CollectionView {
  private autoID!: string;
  private collection_name!: string;
  private description!: string;
  private rowCount!: string;
  private index_status!: string;
  private id!: string;
  private isLoaded!: boolean;
  private schema!: {
    fields: Field[];
  };

  static COLLECTIONS_URL = '/collections';
  static COLLECTIONS_INDEX_STATUS_URL = '/collections/indexes/status';
  static COLLECTIONS_STATISTICS_URL = '/collections/statistics';

  static CHECK_URL = '/milvus/check';

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

  static loadCollection(collectionName: string) {
    return super.update({
      path: `${this.COLLECTIONS_URL}/${collectionName}/load`,
    });
  }

  static releaseCollection(collectionName: string) {
    return super.update({
      path: `${this.COLLECTIONS_URL}/${collectionName}/release`,
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

  get _autoId() {
    return this.autoID;
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

  get _status() {
    return this.isLoaded === true ? StatusEnum.loaded : StatusEnum.unloaded;
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
}
