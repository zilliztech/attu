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
  static codeDir = 'tmp';
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
    const connectPartHeight = connectPart.match(/\n/g).length + 1;
    const pyErrTextReg = new RegExp(
      `\\S*${SandboxService.codeDir}\/\\S*\\.py`,
      'g'
    );
    const pyErrTextWithLineNumReg = new RegExp(
      `"\\S*${SandboxService.codeDir}\/\\S*\\.py", line (\\d+)`,
      'g'
    );
    const pyErrHandler = (output: string) =>
      output
        .replace(
          pyErrTextWithLineNumReg,
          (_, p1) => `"*.py", line ${+p1 - connectPartHeight}`
        )
        .replace(pyErrTextReg, '*.py');
    return await this.runCode({
      command: 'python3',
      codeText: code.join('\n'),
      errHandler: pyErrHandler,
    });
  }

  async runNode(code: string[]) {
    const connectPart = `
import { MilvusClient } from "@zilliz/milvus2-sdk-node";
const address = "${MilvusService.activeAddress}";
const milvusClient = new MilvusClient(address);
`;
    const importLineIndex = code.findIndex(line => !line.includes('import'));
    code.splice(importLineIndex, 0, connectPart);
    const connectPartHeight = connectPart.match(/\n/g).length + 1;
    const nodeErrTextReg = new RegExp(
      `\\S*${SandboxService.codeDir}\/\\S*\\.mjs`,
      'g'
    );
    const nodeErrTextWithLineNumReg = new RegExp(
      `file:\\S*${SandboxService.codeDir}\/\\S*\\.mjs:(\\d+)`,
      'g'
    );
    const nodeErrTextHandler = (output: string) =>
      output
        .replace(
          nodeErrTextWithLineNumReg,
          (_, p1) =>
            `file:*.mjs:${
              +p1 <= connectPartHeight ? p1 : +p1 - connectPartHeight
            }`
        )
        .replace(nodeErrTextReg, '*.mjs');
    return await this.runCode({
      command: 'node',
      codeText: code.join('\n'),
      errHandler: nodeErrTextHandler,
    });
  }

  initCodeDir() {
    try {
      fs.accessSync(`${SandboxService.codeDir}`);
    } catch (err) {
      fs.mkdirSync(`${SandboxService.codeDir}`);
    }
  }

  runCode({
    command,
    codeText,
    infoHandler = (d: string) => d,
    errHandler = (d: string) => d,
  }: {
    command: string; // the executor function of shell, such as "node", "python"
    codeText: string; // The code will be saved to a tmp file
    infoHandler?: (d: string) => string; // handle the stdout of shell
    errHandler?: (d: string) => string; // handle the stderr of shell
  }): Promise<{
    output: string; // output += stdout; output += stderr;
    code: number; // 0: success; 1: error;
  }> {
    return new Promise(resolve => {
      this.initCodeDir();

      const randomString = () => Math.random().toString(36).slice(-8);
      const foo = randomString();
      const filePath = `${SandboxService.codeDir}/attu_sandbox_${command}_${foo}.${commandSuffixMap[command]}`;
      fs.writeFileSync(filePath, codeText);

      const shell = spawn(command, [filePath]);
      let output = '';
      shell.stdout.on('data', data => {
        output += infoHandler(data.toString());
      });
      shell.stderr.on('data', data => {
        output += errHandler(data.toString());
      });
      shell.on('exit', code => {
        fs.unlinkSync(filePath);
        resolve({
          output,
          code,
        });
      });
    });
  }
}
