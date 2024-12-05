import {
  IndexDescription,
  CollectionSchema,
  FieldSchema,
  ReplicaInfo,
  KeyValuePair,
  DescribeIndexResponse,
  DescribeCollectionResponse,
  QuerySegmentInfo,
  PersistentSegmentInfo,
  Function,
} from '@zilliz/milvus2-sdk-node';
import { WS_EVENTS, WS_EVENTS_TYPE, LOADING_STATE } from '../utils';

export interface IndexObject extends IndexDescription {
  indexType: string;
  metricType: string;
  indexParameterPairs: KeyValuePair[];
}
export interface FieldObject extends FieldSchema {
  index: IndexObject;
  // field type params
  dimension: number;
  maxCapacity: number;
  maxLength: number;
  function?: Function;

}

export interface SchemaObject extends CollectionSchema {
  fields: FieldObject[];
  primaryField: FieldObject;
  vectorFields: FieldObject[];
  scalarFields: FieldObject[];
  dynamicFields: FieldObject[];
  functionFields: FieldObject[];
  hasVectorIndex: boolean;
  enablePartitionKey: boolean;
}

export interface DescribeCollectionRes extends DescribeCollectionResponse {
  schema: SchemaObject;
}

export interface DescribeIndexRes extends DescribeIndexResponse {
  index_descriptions: IndexObject[];
}

export type CollectionFullObject = {
  collection_name: string;
  schema: SchemaObject;
  rowCount: number;
  createdTime: number;
  aliases: string[];
  description: string;
  autoID: boolean;
  id: string;
  loadedPercentage: number;
  consistency_level: string;
  replicas: ReplicaInfo[];
  status: LOADING_STATE;
  loaded: boolean;
  properties: KeyValuePair[];
};

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
  loaded: undefined;
  properties: undefined;
};

export type CollectionObject = CollectionFullObject | CollectionLazyObject;

export type CountObject = {
  rowCount: number;
};

export type StatisticsObject = {
  collectionCount: number;
  totalData: number;
};

export type QuerySegmentObjects = QuerySegmentInfo[];
export type PersistentSegmentObjects = PersistentSegmentInfo[];

export type CronJobObject = {
  name: WS_EVENTS;
  type: WS_EVENTS_TYPE;
  payload: {
    database: string;
    collections: string[];
  };
};

export type DatabaseObject = {
  name: string;
  db_name: string;
  dbID: string | number;
  createdTime: number;
  created_timestamp: number;
  properties: KeyValuePair[];
  collections: string[];
};
