import { BYTE_UNITS } from '../consts/Util';
import {
  CreateFieldType,
  DataTypeEnum,
  Field,
} from '../pages/collections/Types';

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
export const formatAddress = (address: string): string =>
  address.trim().replace(/(http|https):\/\//, '');

// generate a sting like 20.22/98.33MB with proper unit
export const getByteString = (
  value1: number,
  value2: number,
  capacityTrans: { [key in string]: string }
) => {
  if (!value1 || !value2) return `0${capacityTrans.b}`;
  const power = Math.round(Math.log(value1) / Math.log(1024));
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
  const byteValue1 = value1 / 1024 ** power;
  const byteValue2 = value2 / 1024 ** power;

  return `${byteValue1.toFixed(2)}/${byteValue2.toFixed(2)} ${unit}`;
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
 * Convert headers and rows to csv string.
 * @param headers csv headers: string[]
 * @param rows csv data rows: {[key in headers]: any}[]
 * @returns csv string
 */
export const generateCsvData = (headers: string[], rows: any[]) => {
  const rowsData = rows.reduce((prev, item: any[]) => {
    headers.forEach((colName: any, idx: number) => {
      const val = item[colName];
      if (typeof val === 'string') {
        prev += val;
      } else if (typeof val === 'object') {
        // Use double quote to ensure csv display correctly
        prev += `"${JSON.stringify(val)}"`;
      } else {
        prev += `${val}`;
      }
      if (idx === headers.length - 1) {
        prev += '\n';
      } else {
        prev += ',';
      }
    });
    return prev;
  }, '');
  return headers.join(',') + '\n' + rowsData;
};
