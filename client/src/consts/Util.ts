export const BYTE_UNITS: { [x: string]: number } = {
  b: 1,
  k: 1024,
  m: 1024 * 1024,
  g: 1024 * 1024 * 1024,
};

export const LOGICAL_OPERATORS = [
  {
    value: '>',
    label: '>',
  },
  {
    value: '>=',
    label: '>=',
  },
  {
    value: '==',
    label: '==',
  },
  {
    value: '!=',
    label: '!=',
  },
  {
    value: '<',
    label: '<',
  },
  {
    value: '<=',
    label: '<=',
  },
  {
    value: 'in',
    label: 'in',
  },
  {
    value: 'not in',
    label: 'not in',
  },
  {
    value: 'like',
    label: 'like',
  },
  {
    value: 'JSON_CONTAINS',
    label: 'JSON_CONTAINS',
  },
  {
    value: 'ARRAY_CONTAINS',
    label: 'ARRAY_CONTAINS',
  },
  {
    value: 'ARRAY_CONTAINS_ALL',
    label: 'ARRAY_CONTAINS_ALL',
  },
];

export enum FILE_MIME_TYPE {
  CSV = 'text/csv',
  JSON = 'application/json',
}
