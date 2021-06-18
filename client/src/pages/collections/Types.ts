import { Dispatch, ReactElement, SetStateAction } from 'react';
import { ChildrenStatusType, StatusEnum } from '../../components/status/Types';

export interface CollectionData {
  _name: string;
  _id: string;
  _status: StatusEnum;
  _rowCount: string;
  _desc: string;
  _indexState: ChildrenStatusType;
}

export interface CollectionView extends CollectionData {
  nameElement?: ReactElement;
  statusElement?: ReactElement;
  indexCreatingElement?: ReactElement;
}

export interface CollectionCreateProps {
  handleCreate: (param: CollectionCreateParam) => void;
}

export interface CollectionCreateParam {
  collection_name: string;
  description: string;
  autoID: boolean;
  fields: Field[];
}

export enum DataTypeEnum {
  Int8 = 2,
  Int16 = 3,
  Int32 = 4,
  Int64 = 5,
  Float = 10,
  Double = 11,
  BinaryVector = 100,
  FloatVector = 101,
}

export interface Field {
  name: string;
  data_type: DataTypeEnum;
  is_primary_key: boolean;
  description: string;
  dimension?: number | string;
  isDefault?: boolean;
  id: string;
  type_params?: { key: string; value: any }[];
}

export type CreateFieldType =
  | 'primaryKey'
  | 'defaultVector'
  | 'vector'
  | 'number';

export interface CreateFieldsProps {
  fields: Field[];
  setFields: Dispatch<SetStateAction<Field[]>>;
  setfieldsAllValid: Dispatch<SetStateAction<boolean>>;
  autoID: boolean;
  setAutoID: (value: boolean) => void;
}
