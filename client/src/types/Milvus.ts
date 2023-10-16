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

export type IndexDescription = {
  fields_name: string;
  index_name: string;
  indexed_rows: string | number;
  state: IndexState;
};

export interface DescribeIndexResponse {
  index_descriptions: IndexDescription[];
}

export enum ShowCollectionsType {
  All = 0,
  InMemory = 1,
}
