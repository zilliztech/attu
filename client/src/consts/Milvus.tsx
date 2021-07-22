export enum METRIC_TYPES_VALUES {
  L2 = 'L2',
  IP = 'IP',
  HAMMING = 'HAMMING',
  JACCARD = 'JACCARD',
  TANIMOTO = 'TANIMOTO',
  SUBSTRUCTURE = 'SUBSTRUCTURE',
  SUPERSTRUCTURE = 'SUPERSTRUCTURE',
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
    value: METRIC_TYPES_VALUES.SUBSTRUCTURE,
    label: 'SUBSTRUCTURE',
  },
  {
    value: METRIC_TYPES_VALUES.SUPERSTRUCTURE,
    label: 'SUPERSTRUCTURE',
  },
  {
    value: METRIC_TYPES_VALUES.HAMMING,
    label: 'HAMMING',
  },
  {
    value: METRIC_TYPES_VALUES.JACCARD,
    label: 'JACCARD',
  },
  {
    value: METRIC_TYPES_VALUES.TANIMOTO,
    label: 'TANIMOTO',
  },
];

export type MetricType =
  | 'L2'
  | 'IP'
  | 'HAMMING'
  | 'SUBSTRUCTURE'
  | 'SUPERSTRUCTURE'
  | 'JACCARD'
  | 'TANIMOTO';

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
  // IVF_SQ8: {
  //   create: ['nlist'],
  //   search: ['nprobe'],
  // },
  // IVF_SQ8_HYBRID: {
  //   create: ['nlist'],
  //   search: ['nprobe'],
  // },
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
  // RNSG: {
  //   create: ['out_degree', 'candidate_pool_size', 'search_length', 'knng'],
  //   search: ['search_length'],
  // },
  BIN_FLAT: {
    create: ['nlist'],
    search: ['nprobe'],
  },
  BIN_IVF_FLAT: {
    create: ['nlist'],
    search: ['nprobe'],
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
  // not all
  // FLOAT_POINT: Object.keys(INDEX_CONFIG).map(v => ({ label: v, value: v })),
  FLOAT_POINT: ['IVF_FLAT', 'IVF_PQ', 'FLAT', 'HNSW', 'ANNOY',].map(v => ({ label: v, value: v })),
  BINARY: ['BIN_IVF_FLAT', 'BIN_FLAT'].map(v => ({ label: v, value: v })),
};

export const PRIMARY_KEY_FIELD = 'INT64 (Primary key)';

export enum EmbeddingTypeEnum {
  float = 'FLOAT_POINT',
  binary = 'BINARY',
}
