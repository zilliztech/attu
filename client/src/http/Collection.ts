import { StatusEnum } from '../components/status/Types';
import { CollectionView } from '../pages/collections/Types';
import BaseModel from './BaseModel';

export class CollectionHttp extends BaseModel implements CollectionView {
  private autoID!: string;
  private collection_name!: string;
  private description!: string;
  private rowCount!: string;

  static COLLECTIONS_URL = '/collections';
  static CHECK_URL = '/milvus/check';

  constructor(props: CollectionView) {
    super(props);
    Object.assign(this, props);
  }

  static getCollections(): Promise<CollectionHttp[]> {
    return super.findAll({ path: this.COLLECTIONS_URL, params: {} });
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
}
