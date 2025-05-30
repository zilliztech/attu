import BaseModel from './BaseModel';
import type {
  RolesWithPrivileges,
  PrivilegeGroup,
  PrivilegeGroupsRes,
  UserWithRoles,
  RBACOptions,
} from '@server/types';
import type {
  CreateUserParams,
  DeleteUserParams,
  UpdateUserParams,
  CreateRoleParams,
  DeleteRoleParams,
  AssignRoleParams,
  UnassignRoleParams,
  CreatePrivilegeGroupParams,
} from '../pages/user/Types';

export class UserService extends BaseModel {
  // get user data
  static getUsers() {
    return super.find<UserWithRoles[]>({ path: `/users`, params: {} });
  }

  // get all roles
  static getRoles() {
    return super.find<RolesWithPrivileges[]>({
      path: `/users/roles`,
      params: {},
    });
  }

  // create user
  static createUser(data: CreateUserParams) {
    return super.create({ path: `/users`, data });
  }

  // update user (pass)
  static updateUser(data: UpdateUserParams) {
    return super.update({ path: `/users`, data });
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
  static getAllPrivilegeGroups() {
    return super.find({
      path: `/users/privilegeGroups`,
      params: {},
    }) as Promise<PrivilegeGroup[]>;
  }

  // get RBAC info
  static getRBAC() {
    return super.find({
      path: `/users/rbac`,
      params: {},
    }) as Promise<RBACOptions>;
  }
  // get privilege groups
  static getPrivilegeGroups() {
    return super.find<PrivilegeGroupsRes>({
      path: `/users/privilege-groups`,
      params: {},
    });
  }
  // create privilege group
  static createPrivilegeGroup(data: CreatePrivilegeGroupParams) {
    return super.create({ path: `/users/privilege-groups`, data });
  }
  // update privilege group
  static updatePrivilegeGroup(data: CreatePrivilegeGroupParams) {
    return super.update({
      path: `/users/privilege-groups/${data.group_name}`,
      data,
    });
  }
  // delete privilege group
  static deletePrivilegeGroup(data: { group_name: string }) {
    return super.delete({ path: `/users/privilege-groups/${data.group_name}` });
  }
}
