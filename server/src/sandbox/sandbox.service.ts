import { MilvusService } from '../milvus/milvus.service';
import {
  CreateUserReq,
  UpdateUserReq,
  DeleteUserReq,
} from '@zilliz/milvus2-sdk-node/dist/milvus/types/User';
import { throwErrorFromSDK } from '../utils/Error';
import fs from 'fs';
import { spawn } from 'child_process';

const commandSuffixMap = {
  python: 'py',
  python3: 'py',
  node: 'mjs',
} as {
  [key: string]: string;
};

export class SandboxService {
  static codeDir = '/tmp';
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

  async runPython(code: string[]) {
    const [host, port] = MilvusService.activeAddress.split(':');

    const connectPart = `
from pymilvus import connections, Collection
connections.connect(
alias="default",
host='${host}',
port='${port}'
)
`;
    code.unshift(connectPart);
    return await this.runCode('python3', code.join('\n'));
  }

  async runNode(code: string[]) {
    const connectPart = `
import { MilvusClient } from "@zilliz/milvus2-sdk-node";
const address = "${MilvusService.activeAddress}";
const milvusClient = new MilvusClient(address);  
`;
    const importLineIndex = code.findIndex(line => !line.includes('import'));
    code.splice(importLineIndex, 0, connectPart)
    return await this.runCode('node', code.join('\n'));
  }

  runCode(command: string, codeText: string) {
    return new Promise(resolve => {
      const randomString = () => Math.random().toString(36).slice(-8);
      const foo = randomString();
      const filePath = `${SandboxService.codeDir}/attu_sandbox_${command}_${foo}.${commandSuffixMap[command]}`;
      fs.writeFileSync(filePath, codeText);

      const shell = spawn(command, [filePath]);
      let output = '';
      shell.stdout.on('data', data => {
        output += data.toString();
      });
      shell.stderr.on('data', data => {
        output += data.toString();
      });
      shell.on('exit', code => {
        const exitOutput = `==> exit with code ${code}`;
        console.log(exitOutput);
        fs.unlinkSync(filePath);
        resolve({
          output,
          code,
        });
      });
    });
  }
}
