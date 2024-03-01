import {
  IndexDescription,
  CollectionSchema,
  FieldSchema,
  ReplicaInfo,
  KeyValuePair,
  DescribeIndexResponse,
  DescribeCollectionResponse,
} from '@zilliz/milvus2-sdk-node';

import { LOADING_STATE } from '../utils';

export type IndexObject = IndexDescription & {
  indexType: string;
  metricType: string;
  indexParameterPairs: KeyValuePair[];
};
export type FieldObject = FieldSchema & {
  index: IndexObject;
  // field type params
  dimension: number;
  maxCapacity: number;
  maxLength: number;
};

export type SchemaObject = CollectionSchema & {
  fields: FieldObject[];
  primaryField: FieldObject;
  vectorFields: FieldObject[];
  scalarFields: FieldObject[];
  hasVectorIndex: boolean;
};

export interface DescribeCollectionRes extends DescribeCollectionResponse {
  schema: SchemaObject;
}

export interface DescribeIndexRes extends DescribeIndexResponse {
  index_descriptions: IndexObject[];
}

export interface CollectionFullObject {
  collection_name: string;
  schema: SchemaObject;
  rowCount: number | string;
  createdTime: number;
  aliases: string[];
  description: string;
  autoID: boolean;
  id: string;
  loadedPercentage: string;
  consistency_level: string;
  replicas: ReplicaInfo[];
  status: LOADING_STATE;
}

export type CollectionLazyObject = {
  id: string;
  collection_name: string;
  status: LOADING_STATE;
  schema: undefined;
  rowCount: undefined;
  createdTime: number;
  aliases: undefined;
  description: undefined;
  autoID: undefined;
  loadedPercentage: undefined;
  consistency_level: undefined;
  replicas: undefined;
};

export type CollectionObject = CollectionFullObject | CollectionLazyObject;
