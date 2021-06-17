import BaseModel from './BaseModel';

export class MilvusHttp extends BaseModel {
  static CONNECT_URL = '/milvus/connect';
  static CHECK_URL = '/milvus/check';

  constructor(props: {}) {
    super(props);
    Object.assign(this, props);
  }

  static connect(address: string) {
    return super.create({ path: this.CONNECT_URL, data: { address } });
  }

  static check(address: string) {
    return super.search({ path: this.CHECK_URL, params: { address } });
  }
}
