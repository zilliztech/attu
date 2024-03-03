import { WS_EVENTS, WS_EVENTS_TYPE } from '@server/utils/Const';
import BaseModel from './BaseModel';

export class MilvusService extends BaseModel {
  static connect(data: {
    address: string;
    username?: string;
    password?: string;
    database?: string;
  }) {
    return super.create({ path: '/milvus/connect', data }) as Promise<{
      address: string;
      database: string;
      clientId: string;
    }>;
  }

  static closeConnection() {
    return super.create({ path: '/milvus/disconnect' });
  }

  static getVersion() {
    return super.search({ path: '/milvus/version', params: {} });
  }

  static check(address: string) {
    return super.search({
      path: '/milvus/check',
      params: { address },
    }) as Promise<{ connected: boolean }>;
  }

  static getMetrics() {
    return super.search({
      path: '/milvus/metrics',
      params: {},
    });
  }

  static triggerCron(data: { name: WS_EVENTS; type: WS_EVENTS_TYPE }) {
    return super.update({
      path: '/crons',
      data,
    });
  }

  static useDatabase(data: { database: string }) {
    return super.create({ path: '/milvus/usedb', data });
  }
}
