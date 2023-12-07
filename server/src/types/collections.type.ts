import {
  IndexDescription,
  CollectionSchema,
  ReplicaInfo,
} from '@zilliz/milvus2-sdk-node';

export interface CollectionData {
  collection_name: string;
  schema: CollectionSchema;
  rowCount: number | string;
  createdTime: number;
  aliases: string[];
  description: string;
  autoID: boolean;
  id: string;
  loadedPercentage: string;
  index_descriptions: IndexDescription[];
  consistency_level: string;
  replicas: ReplicaInfo[];
}
