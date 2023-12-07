import { INDEX_TYPES_ENUM } from '@/consts';

export interface Index {
  params: { key: string; value: string }[];
}

export type IndexType =
  | INDEX_TYPES_ENUM.FLAT
  | INDEX_TYPES_ENUM.IVF_FLAT
  // | 'IVF_SQ8'
  // | 'IVF_SQ8_HYBRID'
  | INDEX_TYPES_ENUM.IVF_PQ
  // | 'RNSG'
  | INDEX_TYPES_ENUM.HNSW
  | INDEX_TYPES_ENUM.ANNOY
  | INDEX_TYPES_ENUM.BIN_IVF_FLAT
  | INDEX_TYPES_ENUM.BIN_FLAT
  | INDEX_TYPES_ENUM.MARISA_TRIE
  | INDEX_TYPES_ENUM.SORT
  | INDEX_TYPES_ENUM.AUTO_INDEX;

export interface IndexManageParam {
  collection_name: string;
  field_name: string;
  index_name: string;
}

export interface IndexCreateParam extends IndexManageParam {
  index_name: string;
  extra_params: IndexExtraParam;
}

export interface IndexExtraParam {
  index_type: string;
  metric_type: string;
  params: string;
}

export interface SizingInfoParam {
  info: {
    memory: string;
    disk: string;
  } | null;
}

export enum SIZE_STATUS {
  'B' = 1,
  'KB' = 2,
  'MB' = 3,
  'GB' = 4,
  'TB' = 5,
}
