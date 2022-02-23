import { WS_EVENTS, WS_EVENTS_TYPE } from '../consts/Http';
import BaseModel from './BaseModel';

export class MilvusHttp extends BaseModel {
  static CONNECT_URL = '/milvus/connect';

  static CHECK_URL = '/milvus/check';
  static FLUSH_URL = '/milvus/flush';
  static METRICS_URL = '/milvus/metrics';
  static VERSION_URL = '/milvus/version';

  static TIGGER_CRON_URL = '/crons';

  constructor(props: {}) {
    super(props);
    Object.assign(this, props);
  }

  static connect(address: string) {
    return super.create({ path: this.CONNECT_URL, data: { address } });
  }

  static getVersion() {
    return super.search({ path: this.VERSION_URL, params: {} });
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

  static getMetrics() {
    return super.search({
      path: this.METRICS_URL,
      params: {},
    });
  }

  static triggerCron(data: { name: WS_EVENTS; type: WS_EVENTS_TYPE }) {
    return super.update({
      path: this.TIGGER_CRON_URL,
      data,
    });
  }
}
