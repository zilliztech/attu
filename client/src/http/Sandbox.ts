import BaseModel from './BaseModel';

export enum LANGUAGE_TYPES {
  PYTHON = 'python',
  NODEJS = 'nodejs',
}

const PYTHON_URL = '/sandbox/python';
const NODEJS_URL = '/sandbox/nodejs';

const lang2sandboxUrl = {
  [LANGUAGE_TYPES.PYTHON]: PYTHON_URL,
  [LANGUAGE_TYPES.NODEJS]: NODEJS_URL,
} as {
  [key in LANGUAGE_TYPES]: string;
};

export class SandboxHttp extends BaseModel {
  constructor(props: {}) {
    super(props);
    Object.assign(this, props);
  }

  static runCode(lang: LANGUAGE_TYPES, code: string[]) {
    // await SandboxHttp.runPython(code)
    return super.code({
      path: lang2sandboxUrl[lang],
      data: { code },
    });
  }
}
