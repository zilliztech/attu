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
  OperateRolePrivilegeReq,
  GrantPrivilegeV2Request,
  RevokePrivilegeV2Request,
} from '@zilliz/milvus2-sdk-node';
import { clientCache } from '../app';

export class UserService {
  async getUsers(clientId: string) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.listUsers();

    return res;
  }

  async createUser(clientId: string, data: CreateUserReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.createUser(data);

    return res;
  }

  async updateUser(clientId: string, data: UpdateUserReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.updateUser(data);

    return res;
  }

  async deleteUser(clientId: string, data: DeleteUserReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.deleteUser(data);
    return res;
  }

  async getRoles(clientId: string, data?: listRoleReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.listRoles(data);

    return res;
  }

  async selectUser(clientId: string, data?: SelectUserReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.selectUser(data);

    return res;
  }

  async createRole(clientId: string, data: CreateRoleReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.createRole(data);

    return res;
  }

  async deleteRole(clientId: string, data: DropRoleReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.dropRole(data);
    return res;
  }

  async assignUserRole(clientId: string, data: AddUserToRoleReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.addUserToRole(data);
    return res;
  }

  async unassignUserRole(clientId: string, data: RemoveUserFromRoleReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.removeUserFromRole(data);
    return res;
  }

  async hasRole(clientId: string, data: HasRoleReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.hasRole(data);
    return res;
  }

  async getPriviegGroups(clientId: string) {
    const { milvusClient } = clientCache.get(clientId);
    const privilegeGrps = await milvusClient.listPrivilegeGroups();

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

    const clusterGrp = ['ClusterAdmin', 'ClusterReadOnly', 'ClusterReadWrite'];

    const databaseGrp = [
      'DatabaseAdmin',
      'DatabaseReadOnly',
      'DatabaseReadWrite',
    ];

    const collectionGrp = [
      'CollectionAdmin',
      'CollectionReadOnly',
      'CollectionReadWrite',
    ];

    let res: Record<string, any> = {};

    ['cluster', 'db', 'collection', 'default', 'custom', 'all'].forEach(
      type => {
        let groups = [] as any[];
        switch (type) {
          case 'cluster':
            groups = privilegeGrps.privilege_groups.filter(g =>
              clusterGrp.includes(g.group_name)
            );
            break;
          case 'db':
            groups = privilegeGrps.privilege_groups.filter(g =>
              databaseGrp.includes(g.group_name)
            );
            break;
          case 'collection':
            groups = privilegeGrps.privilege_groups.filter(g =>
              collectionGrp.includes(g.group_name)
            );
            break;
          case 'default':
            groups = privilegeGrps.privilege_groups.filter(g =>
              defaultGrp.includes(g.group_name)
            );
            break;
          case 'custom':
            groups = privilegeGrps.privilege_groups.filter(
              g => !defaultGrp.includes(g.group_name)
            );
            break;
          case 'all':
            groups = privilegeGrps.privilege_groups;
            break;
        }

        res[type] = groups.sort(
          (a, b) =>
            defaultGrp.indexOf(a.group_name) - defaultGrp.indexOf(b.group_name)
        );
      }
    );

    return res;
  }

  async listGrants(clientId: string, roleName: string) {
    const { milvusClient } = clientCache.get(clientId);
    const res = await milvusClient.listGrants({
      roleName,
    });
    return res;
  }

  async grantRolePrivilege(clientId: string, data: OperateRolePrivilegeReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.grantRolePrivilege(data);
    return res;
  }

  async revokeRolePrivilege(clientId: string, data: OperateRolePrivilegeReq) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.revokeRolePrivilege(data);
    return res;
  }

  async revokeAllRolePrivileges(clientId: string, data: { roleName: string }) {
    // get existing privileges
    const existingPrivileges = await this.listGrants(clientId, data.roleName);

    // revoke all existing privileges
    for (const entity of existingPrivileges.entities) {
      const res = await this.revokePrivilegeV2(clientId, {
        db_name: entity.db_name,
        collection_name: entity.object_name,
        privilege: entity.grantor.privilege.name,
        role: entity.role.name,
      });
    }
  }

  // create privilege group
  async createPrivilegeGroup(clientId: string, data: { group_name: string }) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.createPrivilegeGroup({
      group_name: data.group_name,
    });

    return res;
  }

  // get privilege groups
  async getPrivilegeGroups(clientId: string) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.listPrivilegeGroups();

    return res;
  }

  // get privilege groups and find the one with the name
  async getPrivilegeGroup(clientId: string, data: { group_name: string }) {
    const res = await this.getPrivilegeGroups(clientId);

    const group = res.privilege_groups.find(
      g => g.group_name === data.group_name
    );

    return group;
  }

  // delete privilege group
  async deletePrivilegeGroup(clientId: string, data: { group_name: string }) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.dropPrivilegeGroup({
      group_name: data.group_name,
    });

    return res;
  }

  // update privilege group
  async addPrivilegeToGroup(
    clientId: string,
    data: { group_name: string; privileges: string[] }
  ) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.addPrivilegesToGroup({
      group_name: data.group_name,
      privileges: data.privileges,
    });

    return res;
  }

  // remove privilege from group
  async removePrivilegeFromGroup(
    clientId: string,
    data: { group_name: string; privileges: string[] }
  ) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.removePrivilegesFromGroup({
      group_name: data.group_name,
      privileges: data.privileges,
    });

    return res;
  }

  // grantPrivilegeV2
  async grantPrivilegeV2(clientId: string, data: GrantPrivilegeV2Request) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.grantPrivilegeV2(data);

    return res;
  }

  // revokePrivilegeV2
  async revokePrivilegeV2(clientId: string, data: RevokePrivilegeV2Request) {
    const { milvusClient } = clientCache.get(clientId);

    const res = await milvusClient.revokePrivilegeV2(data);

    return res;
  }
}
