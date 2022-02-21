import { CodeEnum, CodeStatus } from './constants';

export const mockStatusInfo = (type: CodeEnum, msg?: string): CodeStatus => {
  if (type === CodeEnum.success) {
    return {
      error_code: type,
      reason: 'success',
    };
  }
  return {
    error_code: type,
    reason: msg,
  };
};
