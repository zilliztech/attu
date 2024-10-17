import { FieldObject, CollectionObject } from '@server/types';

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

export type GraphNode = {
  id: string;
  data: any;
  x?: number;
  y?: number;
  searchIds: string[];
  color: number;
}; // Add optional x, y for SimulationNodeDatum
export type GraphLink = {
  source: string;
  target: string;
  score: number;
};

export type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

export type SearchParams = {
  collection: CollectionObject;
  searchParams: SearchSingleParams[];
  globalParams: GlobalParams;
  searchResult: SearchResultView[] | null;
  graphData: GraphData;
  searchLatency: number;
};
