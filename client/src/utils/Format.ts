import {
  BYTE_UNITS,
  DEFAULT_MILVUS_PORT,
  DEFAULT_PROMETHEUS_PORT,
  DataTypeEnum,
} from '@/consts';
import { CreateFieldType, Field } from '@/pages/collections/Types';
import { FieldView } from '@/pages/schema/Types';

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
 *
 * @param obj e.g. {name: 'test'}
 * @returns key value pair, e.g. [{key: 'name', value: 'test'}]
 */
export const getKeyValuePairFromObj = (
  obj: { [key in string]: any }
): { key: string; value: any }[] => {
  const pairs: { key: string; value: string }[] = Object.entries(obj).map(
    ([key, value]) => ({
      key,
      value: value as string,
    })
  );
  return pairs;
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

export const getKeyValueListFromJsonString = (
  json: string
): { key: string; value: string }[] => {
  try {
    const obj = JSON.parse(json);
    const pairs = getKeyValuePairFromObj(obj);

    return pairs;
  } catch (err) {
    throw err;
  }
};

// BinarySubstructure includes Superstructure and Substructure
export const checkIsBinarySubstructure = (metricLabel: string): boolean => {
  return metricLabel === 'Superstructure' || metricLabel === 'Substructure';
};

export const getCreateFieldType = (config: Field): CreateFieldType => {
  if (config.is_primary_key) {
    return 'primaryKey';
  }

  if (config.isDefault) {
    return 'defaultVector';
  }

  const vectorTypes = [DataTypeEnum.BinaryVector, DataTypeEnum.FloatVector];
  if (vectorTypes.includes(config.data_type)) {
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
): { value: string; unit: string; power: number } => {
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
export const formatFieldType = (field: FieldView) => {
  const { _fieldType, element_type, _maxLength, _maxCapacity, _dimension } =
    field;

  const elementType =
    element_type !== 'None'
      ? `<${element_type}${_maxLength ? `(${_maxLength})` : ''}>`
      : '';
  const maxCapacity = _maxCapacity ? `[${_maxCapacity}]` : '';
  const dimension = _dimension ? `(${_dimension})` : '';
  const maxLength = _fieldType === 'VarChar' ? `(${_maxLength})` : '';

  return `${_fieldType}${elementType}${maxCapacity}${dimension}${maxLength}`;
};
