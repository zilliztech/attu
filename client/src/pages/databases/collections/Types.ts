import { Dispatch, SetStateAction } from 'react';
import { DataTypeEnum } from '@/consts';

export interface CollectionCreateProps {
  onCreate?: () => void;
}

export interface CollectionCreateParam {
  collection_name: string;
  description: string;
  autoID: boolean;
  fields: CreateField[];
  consistency_level: string;
}

export type AnalyzerType = 'standard' | 'english' | 'chinese';

export interface CreateField {
  name: string | null;
  data_type: DataTypeEnum;
  is_primary_key: boolean;
  is_partition_key?: boolean;
  description: string;
  isDefault?: boolean;
  id?: string;
  dim?: string | number;
  max_length?: string | number;
  createType?: CreateFieldType;
  element_type?: DataTypeEnum;
  max_capacity?: string | number;
  autoID?: boolean;
  enable_analyzer?: boolean;
  enable_match?: boolean;
  analyzer_params?: AnalyzerType | Record<AnalyzerType, any>;
}

export type CreateFieldType =
  | 'primaryKey'
  | 'defaultVector'
  | 'vector'
  | 'number';

export type FieldType = {
  name: string | null;
  data_type: DataTypeEnum;
  element_type?: DataTypeEnum;
  is_primary_key: boolean;
  is_partition_key?: boolean;
  description: string;
  dim?: number | string;
  isDefault?: boolean;
  id?: string;
  type_params?: {
    dim?: string | number;
    max_length?: string | number;
  };
  createType?: CreateFieldType;
  max_length?: string | number;
  max_capacity?: string | number;
  autoID?: boolean;
  enable_analyzer?: boolean;
  enable_match?: boolean;
  analyzer_params?: any;
};

export interface CreateFieldsProps {
  fields: CreateField[];
  setFields: Dispatch<SetStateAction<CreateField[]>>;
  setFieldsValidation: Dispatch<
    SetStateAction<{ [x: string]: string | boolean }[]>
  >;
  autoID: boolean;
  setAutoID: (value: boolean) => void;
}

export interface InsertDataParam {
  partition_name?: string;
  // e.g. [{vector: [1,2,3], age: 10}]
  fields_data: any[];
}

export interface DeleteEntitiesReq {
  expr: string;
  partition_name?: string;
}

export interface LoadReplicaReq {
  replica_number: number;
}
