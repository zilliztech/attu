import {
  CreateUserParams,
  DeleteUserParams,
  UpdateUserParams,
  CreateRoleParams,
  DeleteRoleParams,
  AssignRoleParams,
  UnassignRoleParams,
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

  static createRole(data: CreateRoleParams) {
    return super.create({ path: `${this.USER_URL}/roles`, data });
  }

  static getRoles() {
    return super.search({ path: `${this.USER_URL}/roles`, params: {} });
  }

  static deleteRole(data: DeleteRoleParams) {
    return super.delete({ path: `${this.USER_URL}/roles/${data.roleName}` });
  }

  static updateUserRole(data: AssignRoleParams) {
    return super.update({
      path: `${this.USER_URL}/${data.username}/role/update`,
      data,
    });
  }

  static unassignUserRole(data: UnassignRoleParams) {
    return super.update({
      path: `${this.USER_URL}/${data.username}/role/unassign`,
      data,
    });
  }

  get _names() {
    return this.names;
  }
}
