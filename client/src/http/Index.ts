import {
  IndexCreateParam,
  IndexView,
  ParamPair,
} from '../pages/structure/Types';
import { IndexState } from '../types/Milvus';
import BaseModel from './BaseModel';

export class IndexHttp extends BaseModel implements IndexView {
  params!: ParamPair[];
  field_name!: string;

  constructor(props: {}) {
    super(props);
    Object.assign(this, props);
  }

  static BASE_URL = `/schema/index`;

  static async getIndexStatus(
    collectionName: string,
    fieldName: string
  ): Promise<IndexState> {
    const path = `${this.BASE_URL}/state`;
    return super.findAll({
      path,
      params: { collection_name: collectionName, field_name: fieldName },
    });
  }

  static async getIndexInfo(collectionName: string): Promise<IndexHttp[]> {
    const path = this.BASE_URL;

    const res = await super.findAll({
      path,
      params: { collection_name: collectionName },
    });
    return res.index_descriptions.map((index: any) => new this(index));
  }

  static async createIndex(param: IndexCreateParam) {
    const path = this.BASE_URL;

    return super.create({
      path,
      data: { ...param },
    });
  }

  get _indexType() {
    return this.params.find(p => p.key === 'index_type')?.value || '';
  }

  get _indexParameterPairs() {
    return this.params.filter(p => p.key !== 'index_type');
  }

  get _fieldName() {
    return this.field_name;
  }
}
