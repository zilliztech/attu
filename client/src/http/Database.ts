import {
  CreateDatabaseParams,
  DropDatabaseParams,
} from '../pages/database/Types';
import BaseModel from './BaseModel';

export class DatabaseHttp extends BaseModel {
  private names!: string[];

  constructor(props: {}) {
    super(props);
    Object.assign(this, props);
  }

  static DATABASE_URL = `/databases`;

  static getDatabases() {
    return super.search({ path: this.DATABASE_URL, params: {} }) as Promise<{
      db_names: string[];
    }>;
  }

  static createDatabase(data: CreateDatabaseParams) {
    return super.create({ path: this.DATABASE_URL, data });
  }

  static dropDatabase(data: DropDatabaseParams) {
    return super.delete({ path: `${this.DATABASE_URL}/${data.db_name}` });
  }

  get _names() {
    return this.names;
  }
}
