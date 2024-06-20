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
  | INDEX_TYPES_ENUM.BIN_IVF_FLAT
  | INDEX_TYPES_ENUM.BIN_FLAT
  | INDEX_TYPES_ENUM.MARISA_TRIE
  | INDEX_TYPES_ENUM.SORT
  | INDEX_TYPES_ENUM.AUTOINDEX
  | INDEX_TYPES_ENUM.SPARSE_INVERTED_INDEX
  | INDEX_TYPES_ENUM.SPARSE_WAND
  | INDEX_TYPES_ENUM.INVERTED;

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
