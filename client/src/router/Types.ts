export enum ALL_ROUTER_TYPES {
  // '/'
  OVERVIEW = 'overview',
  // '/collections'
  COLLECTIONS = 'collections',
  // '/collections/:collectionId'
  COLLECTION_DETAIL = 'collection_detail',
  // 'search'
  SEARCH = 'search',
  // 'system'
  SYSTEM = 'system'
}

export type NavInfo = {
  navTitle: string;
  backPath: string;
};

export type RouterConfigType = {
  path: string;
  component: any;
  auth: boolean;
};
