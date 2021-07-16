import BaseModel from './BaseModel';

export class MilvusHttp extends BaseModel {
  static CONNECT_URL = '/milvus/connect';
  static CHECK_URL = '/milvus/check';
  static FLUSH_URL = '/milvus/flush';

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

  static flush(collectionName: string) {
    return super.update({
      path: this.FLUSH_URL,
      data: {
        collection_names: [collectionName],
      },
    });
  }
}
