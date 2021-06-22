import { METRIC_TYPES_VALUES } from '../consts/Milvus';

export type ValidType =
  | 'email'
  | 'require'
  | 'confirm'
  | 'range'
  | 'password'
  | 'clusterName'
  | 'CIDRorIP'
  | 'integer'
  | 'positiveNumber'
  | 'collectionName'
  | 'dimension'
  | 'multiple'
  | 'partitionName';
export interface ICheckMapParam {
  value: string;
  extraParam?: IExtraParam;
  rule: ValidType;
}
export interface IExtraParam {
  // used for confirm type
  compareValue?: string;
  // used for length type
  min?: number;
  max?: number;
  type?: 'string' | 'number';

  // used for dimension
  metricType?: number;
  multipleNumber?: number;
}
export type CheckMap = {
  [key in ValidType]: boolean;
};

export const checkEmptyValid = (value: string): boolean => {
  return value.trim() !== '';
};

export const checkEmail = (value: string): boolean => {
  const re = /\S+@\S+\.\S+/;
  return re.test(value);
};

/* password rules:
 * 1. at least one uppercase letter
 * 2. at least one lowercase letter
 * 3. at least one number
 * 4. at least one nonalphanumeric character: ! @ # $ % ^ & * ( ) _ + - = [ ] { } | '
 */
export const checkPasswordStrength = (value: string): boolean => {
  const re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*([^A-Za-z0-9]))/;
  return re.test(value);
};

export const checkRange = (param: {
  value: string;
  min?: number;
  max?: number;
  type?: 'string' | 'number';
}): boolean => {
  const { value, min = 0, max = 0, type } = param;
  const length = type === 'number' ? Number(value) : value.length;

  let result = true;
  const conditionMap = {
    min: length >= min,
    max: length <= max,
  };
  if (min !== 0) {
    result = result && conditionMap.min;
  }
  if (max !== 0) {
    result = result && conditionMap.max;
  }

  return result;
};

export const checkClusterName = (value: string): boolean => {
  const re = new RegExp('^[A-Za-z0-9+-=._:@/ ]*$');
  return re.test(value);
};

export const checkIP = (value: string): boolean => {
  const re =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return re.test(value);
};

export const checkCIDR = (value: string): boolean => {
  const re =
    /^(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([0-9]|[1-2]\d|3[0-2])$/;
  return re.test(value);
};

export const checkIpOrCIDR = (value: string): boolean => {
  // const re = new RegExp('^([0-9]{1,3}.){3}[0-9]{1,3}($|/(16|24)$)');
  // return re.test(value);
  return checkIP(value) || checkCIDR(value);
};

// collection name can only be combined with number, letter or _
// name max length 255 and can't start with number
export const checkCollectionName = (value: string): boolean => {
  const length = value.length;
  if (length > 254) {
    return false;
  }

  const start = Number(value[0]);
  if (!isNaN(start)) {
    return false;
  }

  const re = /^[0-9,a-z,A-Z$_]+$/;
  return re.test(value);
};

export const checkPartitionName = (value: string): boolean => {
  return value !== '_default';
};

export const checkMultiple = (param: {
  value: string;
  multipleNumber?: number;
}): boolean => {
  const { value, multipleNumber = 1 } = param;
  return Number(value) % multipleNumber === 0;
};

export const checkDimension = (param: {
  value: string;
  metricType?: number;
  multipleNumber?: number;
}): boolean => {
  const { value, metricType, multipleNumber } = param;
  if (
    metricType === METRIC_TYPES_VALUES.IP ||
    metricType === METRIC_TYPES_VALUES.L2
  ) {
    return true;
  }
  return checkMultiple({ value, multipleNumber });
};

export const getCheckResult = (param: ICheckMapParam): boolean => {
  const { value, extraParam = {}, rule } = param;
  const numberValue = Number(value);

  const checkMap = {
    email: checkEmail(value),
    require: checkEmptyValid(value),
    confirm: value === extraParam?.compareValue,
    range: checkRange({
      value,
      min: extraParam?.min,
      max: extraParam?.max,
      type: extraParam?.type,
    }),
    password: checkPasswordStrength(value),
    clusterName: checkClusterName(value),
    CIDRorIP: checkIpOrCIDR(value),
    integer: !isNaN(numberValue) && Number.isInteger(numberValue),
    positiveNumber: !isNaN(numberValue) && numberValue > 0,
    collectionName: checkCollectionName(value),
    dimension: checkDimension({
      value,
      metricType: extraParam?.metricType,
      multipleNumber: extraParam?.multipleNumber,
    }),
    multiple: checkMultiple({
      value,
      multipleNumber: extraParam?.multipleNumber,
    }),
    partitionName: checkPartitionName(value),
  };

  return checkMap[rule];
};
