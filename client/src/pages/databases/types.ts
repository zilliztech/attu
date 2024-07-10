import { FieldObject, CollectionObject, RerankerObj } from '@server/types';

export type SearchSingleParams = {
  anns_field: string;
  params: Record<string, any>;
  data: string;
  expanded: boolean;
  selected: boolean;
  field: FieldObject;
};

export type GlobalParams = {
  topK: number;
  consistency_level: string;
  filter: string;
  rerank: 'rrf' | 'weighted';
  rrfParams: { k: number };
  weightedParams: { weights: number[] };
  round_decimal?: number;
  group_by_field?: string;
  output_fields: string[];
};

export type SearchResultView = {
  // dynamic field names
  [key: string]: any;
  rank: number;
  distance: number;
};

export type SearchParams = {
  collection: CollectionObject;
  searchParams: SearchSingleParams[];
  globalParams: GlobalParams;
  searchResult: SearchResultView[] | null;
  searchLatency: number;
};
