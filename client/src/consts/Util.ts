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
    value: 'TEXT_MATCH',
    label: 'TEXT_MATCH',
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
  {
    value: 'ARRAY_CONTAINS_ANY',
    label: 'ARRAY_CONTAINS_ANY',
  },
  {
    value: 'JSON_CONTAINS_ALL',
    label: 'JSON_CONTAINS_ALL',
  },
  {
    value: 'JSON_CONTAINS_ANY',
    label: 'JSON_CONTAINS_ANY',
  },
];

export enum FILE_MIME_TYPE {
  CSV = 'text/csv',
  JSON = 'application/json',
}

export enum ManageRequestMethods {
  DELETE = 'delete',
  CREATE = 'create',
}
