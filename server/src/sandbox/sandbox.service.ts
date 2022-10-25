import { MilvusService } from '../milvus/milvus.service';
import {
  CreateUserReq,
  UpdateUserReq,
  DeleteUserReq,
} from '@zilliz/milvus2-sdk-node/dist/milvus/types/User';
import { throwErrorFromSDK } from '../utils/Error';

export class SandboxService {
  constructor(private milvusService: MilvusService) {}

  get userManager() {
    return this.milvusService.userManager;
  }

  async getUsers() {
    const res = await this.userManager.listUsers();
    throwErrorFromSDK(res.status);

    return res;
  }

  async createUser(data: CreateUserReq) {
    const res = await this.userManager.createUser(data);
    throwErrorFromSDK(res);

    return res;
  }

  async updateUser(data: UpdateUserReq) {
    const res = await this.userManager.updateUser(data);
    throwErrorFromSDK(res);

    return res;
  }

  async deleteUser(data: DeleteUserReq) {
    const res = await this.userManager.deleteUser(data);
    throwErrorFromSDK(res);
    return res;
  }
}
