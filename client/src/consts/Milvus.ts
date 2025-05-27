export const MILVUS_URL =
  ((window as any)._env_ && (window as any)._env_.MILVUS_URL) || '';

export const MILVUS_DATABASE =
  ((window as any)._env_ && (window as any)._env_.DATABASE) || 'default';

export const DYNAMIC_FIELD = `$meta`;

export enum DataTypeEnum {
  None = 0,
  Bool = 1,
  Int8 = 2,
  Int16 = 3,
  Int32 = 4,
  Int64 = 5,

  Float = 10,
  Double = 11,

  // String = 20,
  VarChar = 21, // variable-length strings with a specified maximum length
  Array = 22,
  JSON = 23,

  BinaryVector = 100,
  FloatVector = 101,
  Float16Vector = 102,
  BFloat16Vector = 103,
  SparseFloatVector = 104,
}

export const VectorTypes = [
  DataTypeEnum.FloatVector,
  DataTypeEnum.BinaryVector,
  DataTypeEnum.Float16Vector,
  DataTypeEnum.BFloat16Vector,
  DataTypeEnum.SparseFloatVector,
];

export enum INDEX_TYPES_ENUM {
  // Vector indexes
  FLAT = 'FLAT',
  IVF_FLAT = 'IVF_FLAT',
  IVF_SQ8 = 'IVF_SQ8',
  IVF_PQ = 'IVF_PQ',
  HNSW = 'HNSW',
  HNSW_SQ = 'HNSW_SQ',
  HNSW_PQ = 'HNSW_PQ',
  HNSW_PRQ = 'HNSW_PRQ',
  SCANN = 'SCANN',
  DISKANN = 'DISKANN',
  // GPU indexes
  GPU_CAGRA = 'GPU_CAGRA',
  GPU_IVF_FLAT = 'GPU_IVF_FLAT',
  GPU_IVF_PQ = 'GPU_IVF_PQ',
  // Binary vector indexes
  BIN_FLAT = 'BIN_FLAT',
  BIN_IVF_FLAT = 'BIN_IVF_FLAT',
  // Scalar indexes
  INVERTED = 'INVERTED',
  STL_SORT = 'STL_SORT',
  Trie = 'Trie',
  BITMAP = 'BITMAP',
  // Sparse vector indexes
  SPARSE_INVERTED_INDEX = 'SPARSE_INVERTED_INDEX',
  // Auto index
  AUTOINDEX = 'AUTOINDEX',
}

export enum METRIC_TYPES_VALUES {
  // Vector metrics
  L2 = 'L2',
  IP = 'IP',
  COSINE = 'COSINE',
  // Binary vector metrics
  HAMMING = 'HAMMING',
  JACCARD = 'JACCARD',
  TANIMOTO = 'TANIMOTO',
  // Sparse vector metrics
  IP_SPARSE = 'IP_SPARSE',
  BM25 = 'BM25',
}

export const METRIC_TYPES = [
  {
    value: METRIC_TYPES_VALUES.L2,
    label: 'L2',
    description: 'Euclidean distance',
  },
  {
    value: METRIC_TYPES_VALUES.IP,
    label: 'IP',
    description: 'Inner product',
  },
  {
    value: METRIC_TYPES_VALUES.COSINE,
    label: 'COSINE',
    description: 'Cosine similarity',
  },
  {
    value: METRIC_TYPES_VALUES.HAMMING,
    label: 'HAMMING',
    description: 'Hamming distance',
  },
  {
    value: METRIC_TYPES_VALUES.JACCARD,
    label: 'JACCARD',
    description: 'Jaccard distance',
  },
  {
    value: METRIC_TYPES_VALUES.TANIMOTO,
    label: 'TANIMOTO',
    description: 'Tanimoto distance',
  },
  {
    value: METRIC_TYPES_VALUES.IP_SPARSE,
    label: 'IP_SPARSE',
    description: 'Inner product for sparse vectors',
  },
  {
    value: METRIC_TYPES_VALUES.BM25,
    label: 'BM25',
    description: 'BM25 scoring for sparse vectors',
  },
];

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

export const DEFAULT_MILVUS_PORT = 19530;

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

export const TOP_K_OPTIONS = [15, 50, 100, 150, 200, 250].map(v => ({
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
export const VectorTypesString: DataTypeStringEnum[] = [
  DataTypeStringEnum.BinaryVector,
  DataTypeStringEnum.FloatVector,
  DataTypeStringEnum.BFloat16Vector,
  DataTypeStringEnum.Float16Vector,
  DataTypeStringEnum.SparseFloatVector,
];

export const NONE_INDEXABLE_DATA_TYPES = [DataTypeStringEnum.JSON];

export type Property = { key: string; value: any; desc: string; type: string };

export const collectionDefaults: Property[] = [
  { key: 'collection.ttl.seconds', value: '', desc: '', type: 'number' },
  {
    key: 'collection.autocompaction.enabled',
    value: '',
    desc: '',
    type: 'boolean',
  },
  { key: 'collection.insertRate.max.mb', value: '', desc: '', type: 'number' },
  { key: 'collection.insertRate.min.mb', value: '', desc: '', type: 'number' },
  { key: 'collection.upsertRate.max.mb', value: '', desc: '', type: 'number' },
  { key: 'collection.upsertRate.min.mb', value: '', desc: '', type: 'number' },
  { key: 'collection.deleteRate.max.mb', value: '', desc: '', type: 'number' },
  { key: 'collection.deleteRate.min.mb', value: '', desc: '', type: 'number' },
  {
    key: 'collection.bulkLoadRate.max.mb',
    value: '',
    desc: '',
    type: 'number',
  },
  {
    key: 'collection.bulkLoadRate.min.mb',
    value: '',
    desc: '',
    type: 'number',
  },
  { key: 'collection.queryRate.max.qps', value: '', desc: '', type: 'number' },
  { key: 'collection.queryRate.min.qps', value: '', desc: '', type: 'number' },
  { key: 'collection.searchRate.max.vps', value: '', desc: '', type: 'number' },
  { key: 'collection.searchRate.min.vps', value: '', desc: '', type: 'number' },
  {
    key: 'collection.diskProtection.diskQuota.mb',
    value: '',
    desc: '',
    type: 'number',
  },
  { key: 'collection.replica.number', value: '', desc: '', type: 'number' },
  { key: 'collection.resource_groups', value: '', desc: '', type: 'string' },
  {
    key: 'partition.diskProtection.diskQuota.mb',
    value: '',
    desc: '',
    type: 'number',
  },
  { key: 'mmap.enabled', value: '', desc: '', type: 'boolean' },
  { key: 'lazyload.enabled', value: '', desc: '', type: 'boolean' },
  { key: 'partitionkey.isolation', value: '', desc: '', type: 'boolean' },
  { key: 'field.skipLoad', value: '', desc: '', type: 'string' },
  { key: 'indexoffsetcache.enabled', value: '', desc: '', type: 'boolean' },
  { key: 'replicate.id', value: '', desc: '', type: 'string' },
  { key: 'replicate.endTS', value: '', desc: '', type: 'string' },
];

export const databaseDefaults: Property[] = [
  { key: 'database.replica.number', value: '', desc: '', type: 'number' },
  { key: 'database.resource_groups', value: '', desc: '', type: 'string' },
  { key: 'database.diskQuota.mb', value: '', desc: '', type: 'number' },
  { key: 'database.max.collections', value: '', desc: '', type: 'number' },
  { key: 'database.force.deny.writing', value: '', desc: '', type: 'boolean' },
  { key: 'database.force.deny.reading', value: '', desc: '', type: 'boolean' },
];

export enum FunctionType {
  Unknown = 0,
  BM25 = 1,
}

export enum IndexState {
  IndexStateNone = 'IndexStateNone',
  Unissued = 'Unissued',
  InProgress = 'InProgress',
  Finished = 'Finished',
  Failed = 'Failed',

  // only used by UI
  Default = '',
  Delete = 'Delete',
}

export const INDEX_OPTIONS_MAP = {
  ['AUTOINDEX']: [{ label: 'AUTOINDEX', value: INDEX_TYPES_ENUM.AUTOINDEX }],
  [DataTypeEnum.FloatVector]: [
    { label: INDEX_TYPES_ENUM.FLAT, value: INDEX_TYPES_ENUM.FLAT },
    { label: INDEX_TYPES_ENUM.IVF_FLAT, value: INDEX_TYPES_ENUM.IVF_FLAT },
    { label: INDEX_TYPES_ENUM.IVF_SQ8, value: INDEX_TYPES_ENUM.IVF_SQ8 },
    { label: INDEX_TYPES_ENUM.IVF_PQ, value: INDEX_TYPES_ENUM.IVF_PQ },
    { label: INDEX_TYPES_ENUM.HNSW, value: INDEX_TYPES_ENUM.HNSW },
    { label: INDEX_TYPES_ENUM.HNSW_SQ, value: INDEX_TYPES_ENUM.HNSW_SQ },
    { label: INDEX_TYPES_ENUM.HNSW_PQ, value: INDEX_TYPES_ENUM.HNSW_PQ },
    { label: INDEX_TYPES_ENUM.HNSW_PRQ, value: INDEX_TYPES_ENUM.HNSW_PRQ },
    { label: INDEX_TYPES_ENUM.SCANN, value: INDEX_TYPES_ENUM.SCANN },
    { label: INDEX_TYPES_ENUM.DISKANN, value: INDEX_TYPES_ENUM.DISKANN },
    { label: INDEX_TYPES_ENUM.GPU_CAGRA, value: INDEX_TYPES_ENUM.GPU_CAGRA },
    {
      label: INDEX_TYPES_ENUM.GPU_IVF_FLAT,
      value: INDEX_TYPES_ENUM.GPU_IVF_FLAT,
    },
    { label: INDEX_TYPES_ENUM.GPU_IVF_PQ, value: INDEX_TYPES_ENUM.GPU_IVF_PQ },
  ],
  [DataTypeEnum.BinaryVector]: [
    { label: INDEX_TYPES_ENUM.BIN_FLAT, value: INDEX_TYPES_ENUM.BIN_FLAT },
    {
      label: INDEX_TYPES_ENUM.BIN_IVF_FLAT,
      value: INDEX_TYPES_ENUM.BIN_IVF_FLAT,
    },
  ],
  [DataTypeEnum.SparseFloatVector]: [
    {
      label: INDEX_TYPES_ENUM.SPARSE_INVERTED_INDEX,
      value: INDEX_TYPES_ENUM.SPARSE_INVERTED_INDEX,
    },
  ],
};

export const SCALAR_INDEX_OPTIONS = [
  { label: INDEX_TYPES_ENUM.INVERTED, value: INDEX_TYPES_ENUM.INVERTED },
  { label: INDEX_TYPES_ENUM.STL_SORT, value: INDEX_TYPES_ENUM.STL_SORT },
  { label: INDEX_TYPES_ENUM.Trie, value: INDEX_TYPES_ENUM.Trie },
  { label: INDEX_TYPES_ENUM.BITMAP, value: INDEX_TYPES_ENUM.BITMAP },
];
