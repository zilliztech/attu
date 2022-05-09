import { MilvusService } from '../milvus/milvus.service';
import {
  CreateUserReq,
  UpdateUserReq,
  DeleteUserReq,
} from '@zilliz/milvus2-sdk-node/dist/milvus/types/User';

export class UserService {
  constructor(private milvusService: MilvusService) {}

  get userManager() {
    return this.milvusService.userManager;
  }

  async getUsers() {
    const result = await this.userManager.listUsers();
    return result;
  }

  async createUser(data: CreateUserReq) {
    const result = await this.userManager.createUser(data);
    return result;
  }

  async updateUser(data: UpdateUserReq) {
    const result = await this.userManager.updateUser(data);
    return result;
  }

  async deleteUser(data: DeleteUserReq) {
    const result = await this.userManager.deleteUser(data);
    return result;
  }
}
