export enum ALL_ROUTER_STATES {
  // '/databases'
  ALL_DATABASES = 'all_databases',
  // '/databases/:databaseId'
  DATABASE_DETAIL = 'database_detail',
  // '/databases/:databaseId/collections/:collectionId'
  COLLECTION_DETAIL = 'collection_detail',
  // '/databases/:databaseId/collections/:collectionId/partitions/:partitionId'
  PARTITION_DETAIL = 'partition_detail',
  // '/tasks'
  ALL_TASKS = 'all_tasks',
  // '/queries'
  ALL_QUERIES = 'all_queries',
  // '/queries/:queryId'
  QUERY_DETAIL = 'query_detail',
}

export type NavInfo = {
  navs: string[];
  backPath: string;
};
