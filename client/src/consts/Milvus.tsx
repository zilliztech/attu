export const VECTOR_TYPE_OPTIONS = [
  {
    label: 'Vector float',
    value: 'VECTOR_FLOAT',
  },
  {
    label: 'Vector binary',
    value: 'VECTOR_BINARY',
  },
];

export const NON_VECTOR_TYPE_OPTIONS = [
  {
    label: 'Number',
    value: 'number',
  },
  {
    label: 'Float',
    value: 'float',
  },
];

export enum METRIC_TYPES_VALUES {
  L2 = 1,
  IP,
  HAMMING,
  JACCARD,
  TANIMOTO,
  SUBSTRUCTURE,
  SUPERSTRUCTURE,
}

export const METRIC_TYPES = [
  {
    value: METRIC_TYPES_VALUES.L2,
    label: 'L2',
  },
  {
    value: METRIC_TYPES_VALUES.IP,
    label: 'IP',
  },
  {
    value: METRIC_TYPES_VALUES.HAMMING,
    label: 'Hamming',
  },
  {
    value: METRIC_TYPES_VALUES.SUBSTRUCTURE,
    label: 'Substructure',
  },
  {
    value: METRIC_TYPES_VALUES.SUPERSTRUCTURE,
    label: 'Superstructure',
  },
  {
    value: METRIC_TYPES_VALUES.JACCARD,
    label: 'Jaccard',
  },
  {
    value: METRIC_TYPES_VALUES.TANIMOTO,
    label: 'Tanimoto',
  },
];

export const BINARY_METRIC_TYPES = [
  'HAMMING',
  'JACCARD',
  'TANIMOTO',
  'SUBSTRUCTURE',
  'SUPERSTRUCTURE',
];

export type searchKeywordsType = 'nprobe' | 'ef' | 'search_k' | 'search_length';

// index
export const INDEX_CONFIG: {
  [x: string]: {
    create: string[];
    search: searchKeywordsType[];
  };
} = {
  IVF_FLAT: {
    create: ['nlist'],
    search: ['nprobe'],
  },
  IVF_PQ: {
    create: ['nlist', 'm'],
    search: ['nprobe'],
  },
  IVF_SQ8: {
    create: ['nlist'],
    search: ['nprobe'],
  },
  IVF_SQ8_HYBRID: {
    create: ['nlist'],
    search: ['nprobe'],
  },
  FLAT: {
    create: ['nlist'],
    search: ['nprobe'],
  },
  HNSW: {
    create: ['M', 'efConstruction'],
    search: ['ef'],
  },
  ANNOY: {
    create: ['n_trees'],
    search: ['search_k'],
  },
  RNSG: {
    create: ['out_degree', 'candidate_pool_size', 'search_length', 'knng'],
    search: ['search_length'],
  },
};

export const COLLECTION_NAME_REGX = /^[0-9,a-z,A-Z$_]+$/;

export const m_OPTIONS = [
  { label: '64', value: 64 },
  { label: '32', value: 32 },
  { label: '16', value: 16 },
  { label: '8', value: 8 },
  { label: '4', value: 4 },
];

export const INDEX_OPTIONS_MAP = {
  FLOAT_POINT: Object.keys(INDEX_CONFIG).map(v => ({ label: v, value: v })),
  BINARY_ONE: [{ label: 'FLAT', value: 'FLAT' }],
  BINARY_TWO: [
    { label: 'FLAT', value: 'FLAT' },
    { label: 'IVF_FLAT', value: 'IVF_FLAT' },
  ],
};

export const FIELD_TYPES = {
  VECTOR_FLOAT: 'vector_float',
  VECTOR_BINARY: 'vector_binary',
  Float: 'float',
  Double: 'double',
  INT32: 'int32',
  INT64: 'int64',
};

export const PRIMARY_KEY_FIELD = 'INT64 (Primary key)';
