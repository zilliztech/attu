import { MilvusService } from '../milvus/milvus.service';
import {
  CreateUserReq,
  UpdateUserReq,
  DeleteUserReq,
} from '@zilliz/milvus2-sdk-node/dist/milvus/types/User';
import { throwErrorFromSDK } from '../utils/Error';
import fs from 'fs';
import { spawn } from 'child_process';

export class SandboxService {
  constructor(private milvusService: MilvusService) {
    this.milvusService = milvusService;
  }

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

  runPython(code: string[]) {
    return new Promise(res => {
      const [host, port] = this.milvusService.address.split(':');

      const connectCode = `
from pymilvus import connections, Collection
connections.connect(
alias="default",
host='${host}',
port='${port}'
)
`;
      console.log(code);
      const importLineIndex = code.findIndex(text => !text.includes('import'));
      code.splice(importLineIndex, 0, connectCode);
      const randomString = () => Math.random().toString(36).slice(-8);
      const foo = randomString();
      const filePath = `/tmp/attu_sandbox_${foo}.py`;
      fs.writeFileSync(filePath, code.join('\n'));
      const python = spawn('python3', [filePath]);

      let output = 'default';
      python.stdout.on('data', data => {
        output = data.toString();
      });
      python.stderr.on('data', data => {
        output = data.toString();
      })
      python.on('exit', _code => {
        console.log('exit', _code);
        fs.unlinkSync(filePath);
        res({
          output,
        });
      });
    });
  }
}
