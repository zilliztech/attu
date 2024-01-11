import { WS_EVENTS, WS_EVENTS_TYPE } from '@server/utils/Const';
import BaseModel from './BaseModel';

export class MilvusService extends BaseModel {
  static CONNECT_URL = '/milvus/connect';
  static DISCONNECT_URL = '/milvus/disconnect';
  static CHECK_URL = '/milvus/check';
  static METRICS_URL = '/milvus/metrics';
  static VERSION_URL = '/milvus/version';
  static USE_DB_URL = '/milvus/usedb';
  static TIGGER_CRON_URL = '/crons';

  constructor(props: {}) {
    super(props);
    Object.assign(this, props);
  }

  static connect(data: {
    address: string;
    username?: string;
    password?: string;
    database?: string;
  }) {
    return super.create({ path: this.CONNECT_URL, data }) as Promise<{
      address: string;
      database: string;
      clientId: string;
    }>;
  }

  static closeConnection() {
    return super.create({ path: this.DISCONNECT_URL });
  }

  static getVersion() {
    return super.search({ path: this.VERSION_URL, params: {} });
  }

  static check(address: string) {
    return super.search({
      path: this.CHECK_URL,
      params: { address },
    }) as Promise<{ connected: boolean }>;
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

  static useDatabase(data: { database: string }) {
    return super.create({ path: this.USE_DB_URL, data });
  }
}
