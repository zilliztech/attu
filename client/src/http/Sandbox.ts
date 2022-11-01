import BaseModel from './BaseModel';

export enum LANGUAGE_ENUM {
  PYTHON = 'python',
  NODEJS = 'nodejs',
}

const PYTHON_URL = '/sandbox/python';
const NODEJS_URL = '/sandbox/nodejs';

const lang2sandboxUrl = {
  [LANGUAGE_ENUM.PYTHON]: PYTHON_URL,
  [LANGUAGE_ENUM.NODEJS]: NODEJS_URL,
} as {
  [key in LANGUAGE_ENUM]: string;
};

export class SandboxHttp extends BaseModel {
  constructor(props: {}) {
    super(props);
    Object.assign(this, props);
  }

  static runCode(lang: LANGUAGE_ENUM, code: string[]) {
    return super.query({
      path: lang2sandboxUrl[lang],
      data: { code },
    });
  }
}
