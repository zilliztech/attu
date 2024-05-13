import { FieldObject, CollectionObject } from '@server/types';

export type SearchSingleParams = {
  anns_field: string;
  params: Record<string, any>;
  data: string;
  expanded: boolean;
  field: FieldObject;
};

export type GlobalParams = {
  topK: number;
  consistency_level: string;
};

export type SearchParams = {
  collection: CollectionObject;
  searchParams: SearchSingleParams[];
  globalParams: GlobalParams;
};
