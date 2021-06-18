import { ChildrenStatusType, StatusEnum } from '../components/status/Types';
import { CollectionView } from '../pages/collections/Types';
import { IndexState } from '../types/Milvus';
import BaseModel from './BaseModel';

export class CollectionHttp extends BaseModel implements CollectionView {
  private autoID!: string;
  private collection_name!: string;
  private description!: string;
  private rowCount!: string;
  private index_status!: string;

  static COLLECTIONS_URL = '/collections';
  static COLLECTIONS_INDEX_STATUS_URL = '/collections/indexes/status';

  static CHECK_URL = '/milvus/check';

  constructor(props: CollectionView) {
    super(props);
    Object.assign(this, props);
  }

  static getCollections(): Promise<CollectionHttp[]> {
    return super.findAll({ path: this.COLLECTIONS_URL, params: {} });
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

  get _autoId() {
    return this.autoID;
  }

  get _desc() {
    return this.description;
  }

  get _id() {
    return '12';
  }

  get _name() {
    return this.collection_name;
  }

  get _rowCount() {
    return this.rowCount;
  }

  get _status() {
    return StatusEnum.loaded;
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
