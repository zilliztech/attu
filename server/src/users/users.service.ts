import { MilvusService } from '../milvus/milvus.service';
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
  Privileges,
  GlobalPrivileges,
  CollectionPrivileges,
  UserPrivileges,
  RbacObjects,
  ListGrantsReq,
  OperateRolePrivilegeReq,
} from '@zilliz/milvus2-sdk-node';
import { throwErrorFromSDK } from '../utils/Error';
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

  async getRBAC() {
    return {
      Privileges,
      GlobalPrivileges,
      CollectionPrivileges,
      UserPrivileges,
      RbacObjects,
    };
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
}
