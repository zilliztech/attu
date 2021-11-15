export enum CodeEnum {
  success = 'Success',
  error = 'Error',
  indexNoExist = 'IndexNotExist',
}

export type CodeStatus = {
  error_code: CodeEnum;
  reason?: string;
};

// error msgs
export const ERR_NO_COLLECTION = 'collection name is invalid';
export const ERR_NO_ADDRESS = 'no address';
export const ERR_NO_PARAM = 'no valid param';
export const ERR_NO_ALIAS = 'no valid alias';
export const ERR_NO_INDEX = 'index not exist';
