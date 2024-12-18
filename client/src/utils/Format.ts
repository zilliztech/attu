import {
  BYTE_UNITS,
  DEFAULT_MILVUS_PORT,
  DEFAULT_PROMETHEUS_PORT,
  VectorTypes,
  DataTypeStringEnum,
  DEFAULT_ANALYZER_PARAMS,
  DataTypeEnum,
} from '@/consts';
import {
  CreateFieldType,
  CreateField,
} from '@/pages/databases/collections/Types';
import { FieldObject } from '@server/types';
import { generateVector } from '.';
import { AnalyzerType } from '@/pages/databases/collections/Types';

/**
 * transform large capacity to capacity in b.
 * @param capacity like: 10g, 10gb, 10m, 10mb, 10k, 10kb, 10b,
 * @return number
 */
export const parseByte = (capacity?: string | number): number => {
  // if it's number return it
  if (!isNaN(Number(capacity))) {
    return capacity as number;
  }
  // capacity is '' or 0 or undefined
  if (!capacity) {
    return 0;
  }
  let lowerCapacity = (capacity as string).toLowerCase();
  const units = BYTE_UNITS;
  const isAlpha = /[a-zA-Z]/;
  const lastStr = lowerCapacity.charAt(lowerCapacity.length - 1);
  const secLastStr = lowerCapacity.charAt(lowerCapacity.length - 2);

  // if last two alpha is string, like: mb gb kb.
  //  delete last alpha b
  if (isAlpha.test(lastStr) && isAlpha.test(secLastStr)) {
    lastStr === 'b' &&
      (lowerCapacity = lowerCapacity.slice(0, lowerCapacity.length - 1));
  }

  const suffix = lowerCapacity.charAt(lowerCapacity.length - 1);
  const digitsPart = lowerCapacity.slice(0, lowerCapacity.length - 1);
  if (units[suffix]) {
    return Number(digitsPart) * units[suffix];
  }
  throw new Error(
    'The specified value for memory ({0}) should specify the units. The postfix should be one of the `b` `k` `m` `g` characters'
  );
};

/**
 *
 * @param search ?name=czz&age=18
 * @returns  {name:'czz',age:'18'}
 */
export const parseLocationSearch = (search: string) => {
  const pairs = search.substring(1).split('&');
  let obj: any = {};

  for (let i in pairs) {
    if (pairs[i] === '') continue;

    const pair = pairs[i].split('=');
    obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }

  return obj;
};

export const getEnumKeyByValue = (enumObj: any, enumValue: any) => {
  const match = Object.entries(enumObj).find(
    ([, value]) => value === enumValue
  );

  if (match) {
    const [key] = match;
    return key;
  }

  return '--';
};

/**
 * @param pairs e.g. [{key: 'key', value: 'value'}]
 * @returns object, e.g. {key: value}
 */
export const getObjFromKeyValuePair = (
  pairs: { key: string; value: any }[]
): { [key in string]: any } => {
  const obj = pairs.reduce((acc, cur) => {
    acc[cur.key] = cur.value;
    return acc;
  }, {} as { [key in string]: any });
  return obj;
};

// BinarySubstructure includes Superstructure and Substructure
export const checkIsBinarySubstructure = (metricLabel: string): boolean => {
  return metricLabel === 'Superstructure' || metricLabel === 'Substructure';
};

export const isVectorType = (field: FieldObject): boolean => {
  return VectorTypes.includes(field.dataType as any);
};

export const getCreateFieldType = (field: CreateField): CreateFieldType => {
  if (field.is_primary_key) {
    return 'primaryKey';
  }

  if (field.isDefault) {
    return 'defaultVector';
  }

  if (
    VectorTypes.includes(field.data_type) ||
    field.data_type === DataTypeEnum.VarCharBM25
  ) {
    return 'vector';
  }

  return 'number';
};

// Trim the address
export const formatAddress = (address: string): string => {
  // remove http or https prefix from address
  const ip = address.replace(/(http):\/\//, '');
  return ip.includes(':') ? ip : `${ip}:${DEFAULT_MILVUS_PORT}`;
};

// format the prometheus address
export const formatPrometheusAddress = (address: string): string => {
  let formatAddress = address;
  // add protocal (default http)
  const withProtocol = address.includes('http');
  if (!withProtocol) formatAddress = 'http://' + formatAddress;
  // add port (default 9090)
  const withPort = address.includes(':');
  if (!withPort) formatAddress = formatAddress + ':' + DEFAULT_PROMETHEUS_PORT;
  return formatAddress;
};

export const formatByteSize = (
  size: number,
  capacityTrans: { [key in string]: string }
) => {
  const power = Math.round(Math.log(size) / Math.log(1024));
  let unit = '';
  switch (power) {
    case 1:
      unit = capacityTrans.kb;
      break;
    case 2:
      unit = capacityTrans.mb;
      break;
    case 3:
      unit = capacityTrans.gb;
      break;
    case 4:
      unit = capacityTrans.tb;
      break;
    case 5:
      unit = capacityTrans.pb;
      break;
    default:
      unit = capacityTrans.b;
      break;
  }
  const byteValue = size / 1024 ** power;
  return {
    value: byteValue.toFixed(2),
    unit,
    power,
    originValue: size,
  };
};

// generate a sting like 20.22/98.33MB with proper unit
export const getByteString = (
  value1: number,
  value2: number,
  capacityTrans: { [key in string]: string }
) => {
  if (!value1 || !value2) return `0${capacityTrans.b}`;
  const formatValue1 = formatByteSize(value1, capacityTrans);
  const formatValue2 = value2 / 1024 ** formatValue1.power;
  return `${formatValue1.value}/${formatValue2.toFixed(2)} ${
    formatValue1.unit
  }`;
};

/**
 * time: 2022-02-15 07:03:32.2981238 +0000 UTC m=+2.434915801
 * @returns 2022-02-15 07:03:32
 */
export const formatSystemTime = (time: string): string => {
  return time.split('.')[0] || '';
};

/**
 * When number is larger than js max number, transform to string by BigInt.
 * @param bigNumber
 * @returns
 */
export const formatUtcToMilvus = (bigNumber: number) => {
  const milvusTimeStamp = BigInt(bigNumber) << BigInt(18);
  return milvusTimeStamp.toString();
};

/**
 * Format field
 * @param bigNumber
 * @returns
 */
export const formatFieldType = (field: FieldObject) => {
  const { name, data_type, element_type, maxLength, maxCapacity, dimension } =
    field;

  if (name === '$meta') {
    return `${data_type}<Dynamic>`;
  }

  const elementType =
    element_type !== 'None'
      ? `<${element_type}${maxLength !== -1 ? `(${maxLength})` : ''}>`
      : '';
  const maxCap = maxCapacity !== -1 ? `[${maxCapacity}]` : '';
  const dim = dimension !== -1 ? `(${dimension})` : '';
  const maxLn = data_type === 'VarChar' ? `(${maxLength})` : '';

  return `${data_type}${elementType}${maxCap}${dim}${maxLn}`;
};

export const isSparseVector = (str: string): boolean => {
  try {
    str = str.trim();

    if (str === '') return false;

    if (str[0] !== '{' || str[str.length - 1] !== '}') return false;

    const innerStr = str.slice(1, -1);

    const pairs = innerStr.split(',');

    for (const pair of pairs) {
      const [key, value] = pair.split(':');
      const trimmedKey = key && key.trim();
      const trimmedValue = value && value.trim();
      if (
        !(
          (trimmedKey.match(/^".*"$/) && trimmedKey.length > 2) ||
          trimmedKey.match(/^\d+$/)
        ) ||
        !trimmedValue.match(/^(\d*\.)?\d+$/)
      ) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
};

// transform ObjStr To JSONStr
// `{a: 1, b: 2}` => `{"a": 1, "b": 2}`
// `{'a': 1, 'b': 2}` => `{"a": 1, "b": 2}`
// `{'a': 1, b: 2}` => `{"a": 1, "b": 2}`
// it may have empty space between key and value
export const transformObjStrToJSONStr = (str: string): string => {
  const objStr = str.replace(/'/g, '"').replace(/(\w+)\s*:/g, '"$1":');
  return objStr;
};

// transform object to valid string without quotes
// {a: 1, b: 2} => '{a: 1, b: 2}'
export const transformObjToStr = (obj: any): string => {
  const str = JSON.stringify(obj);
  return str.replace(/"/g, '');
};

export const generateVectorsByField = (field: FieldObject) => {
  switch (field.data_type) {
    case DataTypeStringEnum.FloatVector:
    case DataTypeStringEnum.BinaryVector:
    case DataTypeStringEnum.Float16Vector:
    case DataTypeStringEnum.BFloat16Vector:
      const dim =
        field.data_type === DataTypeStringEnum.BinaryVector
          ? field.dimension / 8
          : field.dimension;
      return JSON.stringify(generateVector(dim));
    case DataTypeStringEnum.SparseFloatVector:
      return field.is_function_output
        ? 'fox'
        : transformObjToStr({
            [Math.floor(Math.random() * 10)]: Math.random(),
          });
    default:
      return [1, 2, 3];
  }
};

const arrayFormatter = (value: string) => {
  return JSON.parse(value);
};

const sparseVectorFormatter = (str: string) => {
  return JSON.parse(transformObjStrToJSONStr(str));
};

export const VectorStrToObject = {
  [DataTypeStringEnum.FloatVector]: arrayFormatter,
  [DataTypeStringEnum.BinaryVector]: arrayFormatter,
  [DataTypeStringEnum.Float16Vector]: arrayFormatter,
  [DataTypeStringEnum.BFloat16Vector]: arrayFormatter,
  [DataTypeStringEnum.SparseFloatVector]: sparseVectorFormatter,
};

export const getColumnWidth = (field: FieldObject): number => {
  switch (field.data_type) {
    case DataTypeStringEnum.Int64:
    case DataTypeStringEnum.Int32:
    case DataTypeStringEnum.Int16:
    case DataTypeStringEnum.Int8:
      return 200;
    case DataTypeStringEnum.Float:
      return 200;

    case DataTypeStringEnum.VarChar:
      const varCharWidth = field.maxLength * 10;
      return varCharWidth > 350 ? 350 : varCharWidth;

    case DataTypeStringEnum.Bool:
      return 80;

    case DataTypeStringEnum.Array:
      const width =
        getColumnWidth({
          ...field,
          data_type: field.element_type as any,
        }) * field.maxCapacity;
      return width > 350 ? 350 : width;

    default:
      return 350;
  }
};

export const getAnalyzerParams = (
  analyzerParams: AnalyzerType | Record<AnalyzerType, any>
): Record<string, any> => {
  if (typeof analyzerParams === 'string') {
    return DEFAULT_ANALYZER_PARAMS[analyzerParams as AnalyzerType];
  }

  return analyzerParams;
};
