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
import { Users, UsersWithRoles } from '@server/types';

export class UserService extends BaseModel {
  constructor(props: {}) {
    super(props);
    Object.assign(this, props);
  }

  // get user data
  static getUsers() {
    return super.search<Users>({ path: '/users', params: {} });
  }

  // get all roles
  static getRoles() {
    return super.search<UsersWithRoles>({ path: `/users/roles`, params: {} });
  }

  // create user
  static createUser(data: CreateUserParams) {
    return super.create({ path: '/users', data });
  }

  // update user (pass)
  static updateUser(data: UpdateUserParams) {
    return super.update({ path: '/users', data });
  }

  // delete user
  static deleteUser(data: DeleteUserParams) {
    return super.delete({ path: `/users/${data.username}` });
  }

  // update user role
  static updateUserRole(data: AssignRoleParams) {
    return super.update({
      path: `/users/${data.username}/role/update`,
      data,
    });
  }

  // unassign user role
  static unassignUserRole(data: UnassignRoleParams) {
    return super.update({
      path: `/users/${data.username}/role/unassign`,
      data,
    });
  }

  // create a role
  static createRole(data: CreateRoleParams) {
    return super.create({ path: `/users/roles`, data });
  }

  // delete a role
  static deleteRole(data: DeleteRoleParams) {
    return super.delete({ path: `/users/roles/${data.roleName}`, data });
  }

  // update role privileges
  static updateRolePrivileges(data: CreateRoleParams) {
    return super.update({
      path: `/users/roles/${data.roleName}/updatePrivileges`,
      data,
    });
  }

  // get RBAC info
  static getRBAC() {
    return super.search({
      path: `/users/rbac`,
      params: {},
    }) as Promise<{
      GlobalPrivileges: Record<string, unknown>;
      CollectionPrivileges: Record<string, unknown>;
      RbacObjects: Record<string, unknown>;
      UserPrivileges: Record<string, unknown>;
      Privileges: Record<string, unknown>;
    }>;
  }
}
