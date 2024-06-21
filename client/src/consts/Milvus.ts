export const MILVUS_URL =
  ((window as any)._env_ && (window as any)._env_.MILVUS_URL) || '';

export const MILVUS_DATABASE =
  ((window as any)._env_ && (window as any)._env_.DATABASE) || '';

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
  Float16Vector = 102,
  SparseFloatVector = 104,
  BFloat16Vector = 103,
  Array = 22,
}

export const VectorTypes = [
  DataTypeEnum.BinaryVector,
  DataTypeEnum.FloatVector,
  DataTypeEnum.BFloat16Vector,
  DataTypeEnum.Float16Vector,
  DataTypeEnum.SparseFloatVector,
];

export enum INDEX_TYPES_ENUM {
  AUTOINDEX = 'AUTOINDEX',
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
  // sparse
  SPARSE_INVERTED_INDEX = 'SPARSE_INVERTED_INDEX',
  SPARSE_WAND = 'SPARSE_WAND',
  // inverted
  INVERTED = 'INVERTED',
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
  | 'range_filter'
  | 'drop_ratio_search'
  | 'filter'
  | 'itopk_size'
  | 'search_width'
  | 'min_iterations'
  | 'max_iterations'
  | 'team_size';

export type indexConfigType = {
  [x: string]: {
    create: string[];
    search: searchKeywordsType[];
  };
};

// index
export const FLOAT_INDEX_CONFIG: indexConfigType = {
  AUTOINDEX: {
    create: [],
    search: ['level'],
  },
  HNSW: {
    create: ['M', 'efConstruction'],
    search: ['ef'],
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
  SCANN: {
    create: ['nlist', 'with_raw_data'],
    search: ['nprobe'],
  },
};

export const DISK_INDEX_CONFIG: indexConfigType = {
  DISKANN: {
    create: [],
    search: ['search_list'],
  },
};

export const GPU_INDEX_CONFIG: indexConfigType = {
  GPU_CAGRA: {
    create: [
      'intermediate_graph_degree',
      'graph_degree',
      'build_algo',
      'cache_dataset_on_device',
    ],
    search: [
      'itopk_size',
      'search_width',
      'min_iterations',
      'max_iterations',
      'team_size',
    ],
  },
  GPU_IVF_FLAT: {
    create: ['nlist'],
    search: ['nprobe'],
  },
  GPU_IVF_PQ: {
    create: ['nlist', 'm', 'nbits'],
    search: ['nprobe'],
  },
  GPU_BRUTE_FORCE: {
    create: [],
    search: [],
  },
};

export const BINARY_INDEX_CONFIG: indexConfigType = {
  BIN_FLAT: {
    create: [],
    search: [],
  },
  BIN_IVF_FLAT: {
    create: ['nlist'],
    search: ['nprobe'],
  },
};

export const SPARSE_INDEX_CONFIG: indexConfigType = {
  SPARSE_INVERTED_INDEX: {
    create: ['drop_ratio_build'],
    search: ['drop_ratio_search'],
  },
  SPARSE_WAND: {
    create: ['drop_ratio_build'],
    search: ['drop_ratio_search'],
  },
};

export const INDEX_CONFIG: indexConfigType = {
  ...FLOAT_INDEX_CONFIG,
  ...BINARY_INDEX_CONFIG,
  ...SPARSE_INDEX_CONFIG,
  ...DISK_INDEX_CONFIG,
  ...GPU_INDEX_CONFIG,
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
  [DataTypeEnum.SparseFloatVector]: Object.keys(SPARSE_INDEX_CONFIG).map(v => ({
    label: v,
    value: v,
  })),
  [DataTypeEnum.VarChar]: [
    {
      label: 'marisa-trie',
      value: INDEX_TYPES_ENUM.MARISA_TRIE,
    },
  ],
  ['DISK']: Object.keys(DISK_INDEX_CONFIG).map(v => ({
    label: v,
    value: v,
  })),
  ['GPU']: Object.keys(GPU_INDEX_CONFIG).map(v => ({
    label: v,
    value: v,
  })),
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
  search_list: 150,
};

export const DEFAULT_NLIST_VALUE = 1024;

export enum LOADING_STATE {
  LOADED = 'loaded',
  LOADING = 'loading',
  UNLOADED = 'unloaded',
}
export enum LOAD_STATE {
  LoadStateNotExist = 'LoadStateNotExist',
  LoadStateNotLoad = 'LoadStateNotLoad',
  LoadStateLoading = 'LoadStateLoading',
  LoadStateLoaded = 'LoadStateLoaded',
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

export const TOP_K_OPTIONS = [50, 100, 150, 200, 250].map(v => ({
  value: v,
  label: String(v),
}));

export const CONSISTENCY_LEVEL_OPTIONS = [
  {
    value: ConsistencyLevelEnum.Bounded,
    label: ConsistencyLevelEnum.Bounded,
  },
  {
    value: ConsistencyLevelEnum.Strong,
    label: ConsistencyLevelEnum.Strong,
  },
  {
    value: ConsistencyLevelEnum.Session,
    label: ConsistencyLevelEnum.Session,
  },
  {
    value: ConsistencyLevelEnum.Eventually,
    label: ConsistencyLevelEnum.Eventually,
  },
];

export const RERANKER_OPTIONS = [
  {
    label: 'RRF',
    value: 'rrf',
  },
  {
    label: 'Weighted',
    value: 'weighted',
  },
];

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
  Float16Vector = 'Float16Vector',
  BFloat16Vector = 'BFloat16Vector',
  SparseFloatVector = 'SparseFloatVector',
  Array = 'Array',
  None = 'None',
}

export const NONE_INDEXABLE_DATA_TYPES = [
  DataTypeStringEnum.Bool,
  DataTypeStringEnum.JSON,
  DataTypeStringEnum.Array,
];
