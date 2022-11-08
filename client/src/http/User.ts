import {
  CreateUserParams,
  DeleteUserParams,
  UpdateUserParams,
} from '../pages/user/Types';
import BaseModel from './BaseModel';

export class UserHttp extends BaseModel {
  private names!: string[];

  constructor(props: {}) {
    super(props);
    Object.assign(this, props);
  }

  static USER_URL = `/users`;

  static getUsers() {
    return super.search({ path: this.USER_URL, params: {} });
  }

  static createUser(data: CreateUserParams) {
    return super.create({ path: this.USER_URL, data });
  }

  static updateUser(data: UpdateUserParams) {
    return super.update({ path: this.USER_URL, data });
  }

  static deleteUser(data: DeleteUserParams) {
    return super.delete({ path: `${this.USER_URL}/${data.username}` });
  }

  get _names() {
    return this.names;
  }
}
