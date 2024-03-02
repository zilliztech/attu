import {
  CreateDatabaseParams,
  DropDatabaseParams,
} from '../pages/database/Types';
import BaseModel from './BaseModel';

export class DatabaseService extends BaseModel {
  static getDatabases() {
    return super.search<{ db_names: [] }>({
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
