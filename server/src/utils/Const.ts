export const ROW_COUNT = 'row_count';

// use in req header
export const MILVUS_ADDRESS = 'milvus-address';

// for lru cache
export const INSIGHT_CACHE = 'insight_cache';
export const EXPIRED_TIME = 1000 * 60 * 60 * 24;

export enum LOADING_STATE {
  LOADED,
  LOADING,
  UNLOADED,
}

export enum WS_EVENTS {
  COLLECTION = 'COLLECTION',
}

export enum WS_EVENTS_TYPE {
  START,
  STOP,
}

export const DEFAULT_MILVUS_PORT = 19530;
