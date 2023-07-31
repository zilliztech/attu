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

  static USERS_URL = `/users`;
  static ROLES_URL = `/users/roles`;

  // get user data
  static getUsers() {
    return super.search({ path: this.USERS_URL, params: {} });
  }

  // create user
  static createUser(data: CreateUserParams) {
    return super.create({ path: this.USERS_URL, data });
  }

  // update user (pass)
  static updateUser(data: UpdateUserParams) {
    return super.update({ path: this.USERS_URL, data });
  }

  // delete user
  static deleteUser(data: DeleteUserParams) {
    return super.delete({ path: `${this.USERS_URL}/${data.username}` });
  }

  // update user role
  static updateUserRole(data: AssignRoleParams) {
    return super.update({
      path: `${this.USERS_URL}/${data.username}/role/update`,
      data,
    });
  }

  // unassign user role
  static unassignUserRole(data: UnassignRoleParams) {
    return super.update({
      path: `${this.USERS_URL}/${data.username}/role/unassign`,
      data,
    });
  }

  // create a role
  static createRole(data: CreateRoleParams) {
    return super.create({ path: `${this.ROLES_URL}`, data });
  }

  // delete a role
  static deleteRole(data: DeleteRoleParams) {
    return super.delete({ path: `${this.ROLES_URL}/${data.roleName}` });
  }

  // get all roles
  static getRoles() {
    return super.search({ path: `${this.ROLES_URL}`, params: {} });
  }

  // update role privileges
  static updateRolePrivileges(data: CreateRoleParams) {
    return super.update({
      path: `${this.ROLES_URL}/${data.roleName}/updatePrivileges`,
      data,
    });
  }

  // get RBAC info
  static getRBAC() {
    return super.search({ path: `${this.USERS_URL}/rbac`, params: {} });
  }

  get _names() {
    return this.names;
  }
}
