import { Dispatch, ReactElement, SetStateAction } from 'react';
import { ChildrenStatusType } from '@/components/status/Types';
import { LOADING_STATE, DataTypeEnum } from '@/consts';
import { FieldData } from '../schema/Types';

export interface CollectionData {
  _name: string;
  _id: string;
  _loadedPercentage: string;
  _status: LOADING_STATE;
  _rowCount: string;
  _desc: string;
  _indexState: ChildrenStatusType;
  _fields?: FieldData[];
  _consistencyLevel: string;
  _aliases: string[];
  _replicas: Replica[];
  _enableDynamicField: boolean;
  _autoId: boolean;
}

export interface Replica {
  collectionID: string;
  node_ids: string[];
  partition_ids: string[];
  replicaID: string;
  shard_replicas: ShardReplica[];
}

export interface ShardReplica {
  dm_channel_name: string;
  leaderID: string;
  leader_addr: string;
  node_id: string[];
}

export interface CollectionView extends CollectionData {
  nameElement?: ReactElement;
  statusElement?: ReactElement;
  indexCreatingElement?: ReactElement;
}

export interface CollectionCreateProps {
  onCreate?: () => void;
}

export interface CollectionCreateParam {
  collection_name: string;
  description: string;
  autoID: boolean;
  fields: Field[];
  consistency_level: string;
}

export interface Field {
  name: string | null;
  data_type: DataTypeEnum;
  is_primary_key: boolean;
  is_partition_key?: boolean;
  description: string;
  dimension?: number | string;
  isDefault?: boolean;
  id?: string;
  type_params?: {
    dim?: string | number;
    max_length?: string | number;
  };
  createType?: CreateFieldType;
  element_type?: DataTypeEnum;
  max_length?: string | number;
  max_capacity?: string | number;
  autoID?: boolean;
}

export type CreateFieldType =
  | 'primaryKey'
  | 'defaultVector'
  | 'vector'
  | 'number';

export interface CreateFieldsProps {
  fields: Field[];
  setFields: Dispatch<SetStateAction<Field[]>>;
  setFieldsValidation: Dispatch<
    SetStateAction<{ [x: string]: string | boolean }[]>
  >;
  autoID: boolean;
  setAutoID: (value: boolean) => void;
}

export interface InsertDataParam {
  partition_name: string;
  // e.g. [{vector: [1,2,3], age: 10}]
  fields_data: any[];
}

export interface DeleteEntitiesReq {
  expr: string;
  partition_name?: string;
}

export interface AliasesProps {
  aliases: string[];
  collectionName: string;
  onCreate?: Function;
  onDelete?: Function;
}

export interface LoadReplicaReq {
  replica_number: number;
}

export enum TAB_ENUM {
  'schema',
  'partition',
  'data-preview',
  'data-query',
}
