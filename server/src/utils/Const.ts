// note, this module will be shared between server and client, so please don't import server only module here
export const ROW_COUNT = 'row_count';

// use in req header
export const MILVUS_CLIENT_ID = 'milvus-client-id';

// for lru cache
export const CLIENT_CACHE = 'insight_cache';
export const INDEX_CACHE = 'index_cache';
export const CLIENT_TTL = 1000 * 60 * 60 * 24;
export const INDEX_TTL = 1000 * 60 * 60;

export enum WS_EVENTS {
  REGISTER = 'REGISTER',
  COLLECTIONS = 'COLLECTIONS',
  COLLECTION_UPDATE = 'COLLECTION_UPDATE',
}

export enum WS_EVENTS_TYPE {
  START,
  DOING,
  STOP,
  CANCEL,
}

export const DEFAULT_MILVUS_PORT = 19530;

export enum HTTP_STATUS_CODE {
  CONTINUE = 100,
  SWITCHING_PROTOCOLS = 101,
  PROCESSING = 102,
  EARLYHINTS = 103,
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NON_AUTHORITATIVE_INFORMATION = 203,
  NO_CONTENT = 204,
  RESET_CONTENT = 205,
  PARTIAL_CONTENT = 206,
  AMBIGUOUS = 300,
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  SEE_OTHER = 303,
  NOT_MODIFIED = 304,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  PROXY_AUTHENTICATION_REQUIRED = 407,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  LENGTH_REQUIRED = 411,
  PRECONDITION_FAILED = 412,
  PAYLOAD_TOO_LARGE = 413,
  URI_TOO_LONG = 414,
  UNSUPPORTED_MEDIA_TYPE = 415,
  REQUESTED_RANGE_NOT_SATISFIABLE = 416,
  EXPECTATION_FAILED = 417,
  I_AM_A_TEAPOT = 418,
  MISDIRECTED = 421,
  UNPROCESSABLE_ENTITY = 422,
  FAILED_DEPENDENCY = 424,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  HTTP_VERSION_NOT_SUPPORTED = 505,
}

// RBAC: default objects
export enum RbacObjects {
  Collection = 'Collection',
  Global = 'Global',
  User = 'User',
}

// RBAC: collection privileges
export enum CollectionPrivileges {
  CreateIndex = 'CreateIndex',
  DropIndex = 'DropIndex',
  IndexDetail = 'IndexDetail',
  Load = 'Load',
  GetLoadingProgress = 'GetLoadingProgress',
  GetLoadState = 'GetLoadState',
  Release = 'Release',
  Insert = 'Insert',
  Upsert = 'Upsert',
  Delete = 'Delete',
  Search = 'Search',
  Flush = 'Flush',
  GetFlushState = 'GetFlushState',
  Query = 'Query',
  GetStatistics = 'GetStatistics',
  Compaction = 'Compaction',
  Import = 'Import',
  LoadBalance = 'LoadBalance',
  CreatePartition = 'CreatePartition',
  DropPartition = 'DropPartition',
  ShowPartitions = 'ShowPartitions',
  HasPartition = 'HasPartition',
}

// RBAC: global privileges
export enum GlobalPrivileges {
  All = '*',
  CreateCollection = 'CreateCollection',
  DropCollection = 'DropCollection',
  DescribeCollection = 'DescribeCollection',
  ShowCollections = 'ShowCollections',
  RenameCollection = 'RenameCollection',
  FlushAll = 'FlushAll',
  CreateOwnership = 'CreateOwnership',
  DropOwnership = 'DropOwnership',
  SelectOwnership = 'SelectOwnership',
  ManageOwnership = 'ManageOwnership',
  CreateResourceGroup = 'CreateResourceGroup',
  DropResourceGroup = 'DropResourceGroup',
  DescribeResourceGroup = 'DescribeResourceGroup',
  ListResourceGroups = 'ListResourceGroups',
  TransferNode = 'TransferNode',
  TransferReplica = 'TransferReplica',
  CreateDatabase = 'CreateDatabase',
  ListDatabases = 'ListDatabases',
  DropDatabase = 'DropDatabase',
  CreateAlias = 'CreateAlias',
  DropAlias = 'DropAlias',
  DescribeAlias = 'DescribeAlias',
  ListAliases = 'ListAliases',
}

// RBAC: user privileges
export enum UserPrivileges {
  UpdateUser = 'UpdateUser',
  SelectUser = 'SelectUser',
}

// RBAC: all privileges
export const Privileges = {
  ...CollectionPrivileges,
  ...UserPrivileges,
  ...GlobalPrivileges,
};

export enum LOADING_STATE {
  LOADED = 'loaded',
  LOADING = 'loading',
  UNLOADED = 'unloaded',
}

export const MIN_INT64 = `-9223372036854775807`; // safe int64 min value
export const DYNAMIC_FIELD = `$meta`;
