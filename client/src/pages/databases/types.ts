import { FieldObject } from '@server/types';

export type SearchSingleParams = {
  anns_field: string;
  params: Record<string, any>;
  data: any[];
  field: FieldObject;
};

export type GlobalParams = {
  topK: number;
  consistency_level: string;
};

export type SearchParams = {
  searchParams: SearchSingleParams[];
  globalParams: GlobalParams;
};
