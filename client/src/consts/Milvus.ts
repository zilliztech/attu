export const MILVUS_URL =
  ((window as any)._env_ && (window as any)._env_.MILVUS_URL) || '';

export const DYNAMIC_FIELD = `$meta`;

export enum DataTypeEnum {
  Bool = 1,
  Int8 = 2,
  Int16 = 3,
  Int32 = 4,
  Int64 = 5,
  Float = 10,
  Double = 11,
  String = 20,
  VarChar = 21,
  JSON = 23,
  BinaryVector = 100,
  FloatVector = 101,
  Array = 22,
}

export enum INDEX_TYPES_ENUM {
  AUTO_INDEX = 'AUTO_INDEX',
  IVF_FLAT = 'IVF_FLAT',
  IVF_PQ = 'IVF_PQ',
  IVF_SQ8 = 'IVF_SQ8',
  IVF_SQ8_HYBRID = 'IVF_SQ8_HYBRID',
  FLAT = 'FLAT',
  HNSW = 'HNSW',
  ANNOY = 'ANNOY',
  RNSG = 'RNSG',
  BIN_IVF_FLAT = 'BIN_IVF_FLAT',
  BIN_FLAT = 'BIN_FLAT',
  SORT = 'STL_SORT',
  MARISA_TRIE = 'Trie',
}

export enum METRIC_TYPES_VALUES {
  L2 = 'L2',
  IP = 'IP',
  COSINE = 'COSINE',
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
    value: METRIC_TYPES_VALUES.COSINE,
    label: 'COSINE',
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
  | 'COSINE'
  | 'HAMMING'
  | 'SUBSTRUCTURE'
  | 'SUPERSTRUCTURE'
  | 'JACCARD'
  | 'TANIMOTO';

export type searchKeywordsType =
  | 'nprobe'
  | 'ef'
  | 'search_k'
  | 'search_length'
  | 'round_decimal'
  | 'level'
  | 'search_list'
  | 'radius'
  | 'range_filter';

export type indexConfigType = {
  [x: string]: {
    create: string[];
    search: searchKeywordsType[];
  };
};

// index
export const FLOAT_INDEX_CONFIG: indexConfigType = {
  SCANN: {
    create: ['nlist'],
    search: ['nprobe'],
  },
  IVF_FLAT: {
    create: ['nlist'],
    search: ['nprobe'],
  },
  IVF_PQ: {
    create: ['nlist', 'm', 'nbits'],
    search: ['nprobe'],
  },
  IVF_SQ8: {
    create: ['nlist'],
    search: ['nprobe'],
  },
  FLAT: {
    create: [],
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
  AUTOINDEX: {
    create: [],
    search: ['level'],
  },
  DISKANN: {
    create: [],
    search: ['search_list'],
  },
};

export const BINARY_INDEX_CONFIG: indexConfigType = {
  // },
  BIN_FLAT: {
    create: ['nlist'],
    search: [],
  },
  BIN_IVF_FLAT: {
    create: ['nlist'],
    search: ['nprobe'],
  },
};

export const INDEX_CONFIG: indexConfigType = {
  ...FLOAT_INDEX_CONFIG,
  ...BINARY_INDEX_CONFIG,
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
  [DataTypeEnum.FloatVector]: Object.keys(FLOAT_INDEX_CONFIG).map(v => ({
    label: v,
    value: v,
  })),
  [DataTypeEnum.BinaryVector]: Object.keys(BINARY_INDEX_CONFIG).map(v => ({
    label: v,
    value: v,
  })),
  [DataTypeEnum.VarChar]: [
    {
      label: 'marisa-trie',
      value: INDEX_TYPES_ENUM.MARISA_TRIE,
    },
  ],
};

export const METRIC_OPTIONS_MAP = {
  [DataTypeEnum.FloatVector]: [
    {
      value: METRIC_TYPES_VALUES.L2,
      label: METRIC_TYPES_VALUES.L2,
    },
    {
      value: METRIC_TYPES_VALUES.IP,
      label: METRIC_TYPES_VALUES.IP,
    },
    {
      value: METRIC_TYPES_VALUES.COSINE,
      label: METRIC_TYPES_VALUES.COSINE,
    },
  ],
  [DataTypeEnum.BinaryVector]: [
    {
      value: METRIC_TYPES_VALUES.SUBSTRUCTURE,
      label: METRIC_TYPES_VALUES.SUBSTRUCTURE,
    },
    {
      value: METRIC_TYPES_VALUES.SUPERSTRUCTURE,
      label: METRIC_TYPES_VALUES.SUPERSTRUCTURE,
    },
    {
      value: METRIC_TYPES_VALUES.HAMMING,
      label: METRIC_TYPES_VALUES.HAMMING,
    },
    {
      value: METRIC_TYPES_VALUES.JACCARD,
      label: METRIC_TYPES_VALUES.JACCARD,
    },
    {
      value: METRIC_TYPES_VALUES.TANIMOTO,
      label: METRIC_TYPES_VALUES.TANIMOTO,
    },
  ],
};

/**
 * use L2 as float default metric type
 * use Hamming as binary default metric type
 */
export const DEFAULT_METRIC_VALUE_MAP = {
  [DataTypeEnum.FloatVector]: METRIC_TYPES_VALUES.L2,
  [DataTypeEnum.BinaryVector]: METRIC_TYPES_VALUES.HAMMING,
};

// search params default value map
export const DEFAULT_SEARCH_PARAM_VALUE_MAP: {
  [key in searchKeywordsType]?: number;
} = {
  // range: [top_k, 32768]
  ef: 250,
  // range: [1, nlist]
  nprobe: 1,
  // range: {-1} ∪ [top_k, n × n_trees]
  search_k: 250,
  // range: [10, 300]
  search_length: 10,
  level: 1,
  search_list: 20,
};

export const DEFAULT_NLIST_VALUE = 1024;

export enum LOADING_STATE {
  LOADED,
  LOADING,
  UNLOADED,
}

export const DEFAULT_VECTORS = 100000;
export const DEFAULT_SEFMENT_FILE_SIZE = 1024;
export const DEFAULT_MILVUS_PORT = 19530;
export const DEFAULT_PROMETHEUS_PORT = 9090;

export enum MILVUS_NODE_TYPE {
  ROOTCOORD = 'rootcoord',
  QUERYCOORD = 'querycoord',
  INDEXCOORD = 'indexcoord',
  QUERYNODE = 'querynode',
  INDEXNODE = 'indexnode',
  DATACORD = 'datacord',
  DATANODE = 'datanode',
  PROXY = 'proxy',
}

export enum MILVUS_DEPLOY_MODE {
  DISTRIBUTED = 'DISTRIBUTED',
  STANDALONE = 'STANDALONE',
}

export enum ConsistencyLevelEnum {
  Strong = 'Strong',
  Session = 'Session', // default in PyMilvus
  Bounded = 'Bounded',
  Eventually = 'Eventually',
  Customized = 'Customized', // Users pass their own `guarantee_timestamp`.
}

export enum DataTypeStringEnum {
  Bool = 'Bool',
  Int8 = 'Int8',
  Int16 = 'Int16',
  Int32 = 'Int32',
  Int64 = 'Int64',
  Float = 'Float',
  Double = 'Double',
  String = 'String',
  VarChar = 'VarChar',
  JSON = 'JSON',
  BinaryVector = 'BinaryVector',
  FloatVector = 'FloatVector',
  Array = 'Array',
  None = 'None',
}

export const NONE_INDEXABLE_DATA_TYPES = [
  DataTypeStringEnum.Bool,
  DataTypeStringEnum.JSON,
  DataTypeStringEnum.Array,
];
