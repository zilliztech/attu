import BaseModel from './BaseModel';
import type { DatabaseObject, ResStatus } from '@server/types';

// request types
export interface CreateDatabaseParams {
  db_name: string;
}

export interface DropDatabaseParams {
  db_name: string;
}

export interface AlterDatabaseRequest {
  db_name: string;
  properties: Record<string, unknown>;
}

export class DatabaseService extends BaseModel {
  static listDatabases() {
    return super.search<DatabaseObject[]>({
      path: `/databases`,
      params: {},
    });
  }

  static createDatabase(data: CreateDatabaseParams) {
    return super.create<ResStatus>({ path: `/databases`, data });
  }

  static dropDatabase(data: DropDatabaseParams) {
    return super.delete<ResStatus>({ path: `/databases/${data.db_name}` });
  }

  static describeDatabase(db_name: string) {
    return super.search<DatabaseObject>({
      path: `/databases/${db_name}`,
      params: {},
    });
  }

  static setProperty(data: AlterDatabaseRequest) {
    const { db_name, ...properties } = data;
    return super.update({
      path: `/databases/${db_name}/properties`,
      data: properties,
    });
  }
}
