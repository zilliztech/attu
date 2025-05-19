import { Dispatch, SetStateAction } from 'react';
import { DataTypeEnum, FunctionType } from '@/consts';

export interface CollectionCreateProps {
  onCreate?: (collection_name: string) => void;
}

export type FunctionConfig = {
  name: string;
  description: string;
  type: FunctionType;
  input_field_names: string[];
  output_field_names: string[];
  params: Record<string, unknown>;
};

export interface CollectionCreateParam {
  collection_name: string;
  description: string;
  fields: CreateField[];
  consistency_level: string;
  functions: FunctionConfig[];
  properties: Record<string, unknown>;
}

export type AnalyzerType = 'standard' | 'english' | 'chinese';

export interface CreateField {
  name: string;
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
  nullable?: boolean;
  default_value?: any;
}

export type CreateFieldType =
  | 'primaryKey'
  | 'defaultVector'
  | 'vector'
  | 'number';

export type FieldType = {
  name: string;
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
  nullable?: boolean;
  default_value?: any;
};

export interface CreateFieldsProps {
  fields: CreateField[];
  setFields: Dispatch<SetStateAction<CreateField[]>>;
  onValidationChange: (isValid: boolean) => void;
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
