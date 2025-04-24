import BaseModel from './BaseModel';
import { CronJobObject } from '@server/types';
import type { AuthReq, AuthObject } from '@server/types';

export class MilvusService extends BaseModel {
  static connect(data: AuthReq) {
    return super.create({
      path: `/milvus/connect`,
      data,
    }) as Promise<AuthObject>;
  }

  static closeConnection() {
    return super.create({ path: `/milvus/disconnect` });
  }

  static getVersion() {
    return super.find({ path: `/milvus/version`, params: {} });
  }

  static check(address: string) {
    return super.find({
      path: `/milvus/check`,
      params: { address },
    }) as Promise<{ connected: boolean }>;
  }

  static getMetrics() {
    return super.find({
      path: `/milvus/metrics`,
      params: {},
    });
  }

  static triggerCron(data: CronJobObject) {
    return super.update({
      path: `/crons`,
      data,
    });
  }

  static useDatabase(data: { database: string }) {
    return super.create({ path: `/milvus/usedb`, data });
  }

  static request(data: PlaygroundRequestOptions) {
    return super.create({ path: `/playground`, data });
  }
}

type PlaygroundRequestOptions = {
  url: string;
  method?: string;
  host?: string;
  headers?: Record<string, string | undefined>;
  params?: Record<string, string>;
  body?: Record<string, any>;
};
