import {
  CreateDatabaseParams,
  DropDatabaseParams,
} from '../pages/dbAdmin/Types';
import BaseModel from './BaseModel';
import { DatabaseObject } from '@server/types';

export class DatabaseService extends BaseModel {
  static listDatabases() {
    return super.search<DatabaseObject[]>({
      path: `/databases`,
      params: {},
    });
  }

  static createDatabase(data: CreateDatabaseParams) {
    return super.create({ path: `/databases`, data });
  }

  static dropDatabase(data: DropDatabaseParams) {
    return super.delete({ path: `/databases/${data.db_name}` });
  }
}
