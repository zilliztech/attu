import {
  CreateUserReq,
  UpdateUserReq,
  DeleteUserReq,
  CreateRoleReq,
  DropRoleReq,
  AddUserToRoleReq,
  RemoveUserFromRoleReq,
  HasRoleReq,
  listRoleReq,
  SelectUserReq,
  ListGrantsReq,
  OperateRolePrivilegeReq,
  GrantPrivilegeV2Request,
  RevokePrivilegeV2Request,
} from '@zilliz/milvus2-sdk-node';
import { throwErrorFromSDK } from '../utils/Error';
import { Privileges } from '../utils';
import { clientCache } from '../app';

export class UserService {
  async getUsers(clientId: string) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.listUsers();
    throwErrorFromSDK(res.status);

    return res;
  }

  async createUser(clientId: string, data: CreateUserReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.createUser(data);
    throwErrorFromSDK(res);

    return res;
  }

  async updateUser(clientId: string, data: UpdateUserReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.updateUser(data);
    throwErrorFromSDK(res);

    return res;
  }

  async deleteUser(clientId: string, data: DeleteUserReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.deleteUser(data);
    throwErrorFromSDK(res);
    return res;
  }

  async getRoles(clientId: string, data?: listRoleReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.listRoles(data);
    throwErrorFromSDK(res.status);

    return res;
  }

  async selectUser(clientId: string, data?: SelectUserReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.selectUser(data);
    throwErrorFromSDK(res.status);

    return res;
  }

  async createRole(clientId: string, data: CreateRoleReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.createRole(data);
    throwErrorFromSDK(res);

    return res;
  }

  async deleteRole(clientId: string, data: DropRoleReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.dropRole(data);
    throwErrorFromSDK(res);
    return res;
  }

  async assignUserRole(clientId: string, data: AddUserToRoleReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.addUserToRole(data);
    throwErrorFromSDK(res);
    return res;
  }

  async unassignUserRole(clientId: string, data: RemoveUserFromRoleReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.removeUserFromRole(data);
    throwErrorFromSDK(res);
    return res;
  }

  async hasRole(clientId: string, data: HasRoleReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.hasRole(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async getRBAC(clientId: string) {
    const { milvusClient } = clientCache.get(clientId);
    const privilegeGrps = await milvusClient.listPrivilegeGroups();

    throwErrorFromSDK(privilegeGrps.status);

    const defaultGrp = [
      'ClusterAdmin',
      'ClusterReadOnly',
      'ClusterReadWrite',

      'DatabaseAdmin',
      'DatabaseReadOnly',
      'DatabaseReadWrite',

      'CollectionAdmin',
      'CollectionReadOnly',
      'CollectionReadWrite',
    ];

    // only show default groups
    const groups = privilegeGrps.privilege_groups.filter(
      g => defaultGrp.indexOf(g.group_name) !== -1
    );

    // sort groups by the order in defaultGrp
    groups.sort(
      (a, b) =>
        defaultGrp.indexOf(a.group_name) - defaultGrp.indexOf(b.group_name)
    );

    return groups;
  }

  async listGrants(clientId: string, data: ListGrantsReq) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.listGrants(data);
    throwErrorFromSDK(res.status);
    return res;
  }

  async grantRolePrivilege(clientId: string, data: OperateRolePrivilegeReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.grantRolePrivilege(data);
    throwErrorFromSDK(res);
    return res;
  }

  async revokeRolePrivilege(clientId: string, data: OperateRolePrivilegeReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.revokeRolePrivilege(data);
    throwErrorFromSDK(res);
    return res;
  }

  async revokeAllRolePrivileges(clientId: string, data: { roleName: string }) {
    // get existing privileges
    const existingPrivileges = await this.listGrants(clientId, {
      roleName: data.roleName,
    });

    // revoke all
    for (let i = 0; i < existingPrivileges.entities.length; i++) {
      const res = existingPrivileges.entities[i];
      await this.revokeRolePrivilege(clientId, {
        object: res.object.name,
        objectName: res.object_name,
        privilegeName: res.grantor.privilege.name,
        roleName: res.role.name,
      });
    }
  }

  // create privilege group
  async createPrivilegeGroup(clientId: string, data: { group_name: string }) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.createPrivilegeGroup({
      group_name: data.group_name,
    });

    throwErrorFromSDK(res);
    return res;
  }

  // get privilege groups
  async getPrivilegeGroups(clientId: string) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.listPrivilegeGroups();

    throwErrorFromSDK(res.status);

    return res;
  }

  // get privilege groups and find the one with the name
  async getPrivilegeGroup(clientId: string, data: { group_name: string }) {
    const res = await this.getPrivilegeGroups(clientId);

    const group = res.privilege_groups.find(
      g => g.group_name === data.group_name
    );

    throwErrorFromSDK(res.status);
    return group;
  }

  // delete privilege group
  async deletePrivilegeGroup(clientId: string, data: { group_name: string }) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.dropPrivilegeGroup({
      group_name: data.group_name,
    });

    throwErrorFromSDK(res);
    return res;
  }

  // update privilege group
  async addPrivilegeToGroup(
    clientId: string,
    data: { group_name: string; priviliges: string[] }
  ) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.addPrivilegesToGroup({
      group_name: data.group_name,
      privileges: data.priviliges,
    });

    throwErrorFromSDK(res);
    return res;
  }

  // remove privilege from group
  async removePrivilegeFromGroup(
    clientId: string,
    data: { group_name: string; priviliges: string[] }
  ) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.removePrivilegesFromGroup({
      group_name: data.group_name,
      privileges: data.priviliges,
    });

    throwErrorFromSDK(res);
    return res;
  }

  // grantPrivilegeV2
  async grantPrivilegeV2(clientId: string, data: GrantPrivilegeV2Request) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.grantPrivilegeV2(data);

    throwErrorFromSDK(res);
    return res;
  }

  // revokePrivilegeV2
  async revokePrivilegeV2(clientId: string, data: RevokePrivilegeV2Request) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.revokePrivilegeV2(data);

    throwErrorFromSDK(res);
    return res;
  }
}
