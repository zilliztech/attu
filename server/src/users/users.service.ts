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
} from '@zilliz/milvus2-sdk-node';
import { throwErrorFromSDK } from '../utils/Error';

export class UserService {
  constructor(private milvusService: MilvusService) {}

  async getUsers() {
    const res = await this.milvusService.client.listUsers();
    throwErrorFromSDK(res.status);

    return res;
  }

  async createUser(data: CreateUserReq) {
    const res = await this.milvusService.client.createUser(data);
    throwErrorFromSDK(res);

    return res;
  }

  async updateUser(data: UpdateUserReq) {
    const res = await this.milvusService.client.updateUser(data);
    throwErrorFromSDK(res);

    return res;
  }

  async deleteUser(data: DeleteUserReq) {
    const res = await this.milvusService.client.deleteUser(data);
    throwErrorFromSDK(res);
    return res;
  }

  async getRoles(data?: listRoleReq) {
    const res = await this.milvusService.client.listRoles(data);
    throwErrorFromSDK(res.status);

    return res;
  }

  async selectUser(data?: SelectUserReq) {
    const res = await this.milvusService.client.selectUser(data);
    throwErrorFromSDK(res.status);

    return res;
  }

  async createRole(data: CreateRoleReq) {
    const res = await this.milvusService.client.createRole(data);
    throwErrorFromSDK(res);

    return res;
  }

  async deleteRole(data: DropRoleReq) {
    const res = await this.milvusService.client.dropRole(data);
    throwErrorFromSDK(res);
    return res;
  }

  async assignUserRole(data: AddUserToRoleReq) {
    const res = await this.milvusService.client.addUserToRole(data);
    throwErrorFromSDK(res);
    return res;
  }

  async unassignUserRole(data: RemoveUserFromRoleReq) {
    const res = await this.milvusService.client.addUserToRole(data);
    throwErrorFromSDK(res);
    return res;
  }

  async hasRole(data: HasRoleReq) {
    const res = await this.milvusService.client.hasRole(data);
    throwErrorFromSDK(res.status);
    return res;
  }
}
