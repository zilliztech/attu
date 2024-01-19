import { saveAs } from 'file-saver';
import { Parser } from '@json2csv/plainjs';

export const copyToCommand = (
  value: string,
  classSelector?: string,
  cb?: () => void
) => {
  const element = classSelector
    ? document.querySelector(`.${classSelector}`)
    : document.body;
  const input = document.createElement('textarea');
  input.value = value;
  element?.appendChild(input);
  input.select();

  if (document.execCommand('copy')) {
    document.execCommand('copy');
    cb && cb();
  }
  element?.removeChild(input);
};

export const generateId = (prefix = 'id') =>
  `${prefix}_${Math.random().toString(36).substr(2, 16)}`;

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat().format(number);
};

/**
 * Only use in dev env
 * Parent component props is optional but required in child component. Need throw some error
 * @param text
 */
export const throwErrorForDev = (text: string) => {
  throw new Error(text);
};

/**
 *
 * @param obj key value pair Array
 * @param key the target you want to find.
 * @returns undefined | string
 */
export const findKeyValue = (
  obj: { key: string; value: string }[],
  key: string
) => obj.find(v => v.key === key)?.value;

export const generateHashCode = (source: string) => {
  let hash = 0,
    i,
    chr;
  if (source.length === 0) return hash;
  for (i = 0; i < source.length; i++) {
    chr = source.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
};

export const generateIdByHash = (salt?: string) => {
  return generateHashCode(`${new Date().getTime().toString()}-${salt}`);
};

export const generateVector = (dim: number) => {
  return Array.from({ length: dim }).map(() => Math.random());
};

export const cloneObj = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
};

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const detectItemType = (item: unknown) => {
  if (Array.isArray(item)) {
    return 'array';
  } else if (typeof item === 'object' && item !== null) {
    return 'json';
  } else if (typeof item === 'boolean') {
    return 'bool';
  } else {
    return 'unknown';
  }
};

export const saveCsvAs = (csvObj: any, as: string) => {
  try {
    const opts = {};
    const parser = new Parser(opts);
    const csv = parser.parse(csvObj);
    const csvData = new Blob([csv], {
      type: 'text/csv;charset=utf-8',
    });
    saveAs(csvData, as);
  } catch (err) {
    console.error(err);
  }
};
