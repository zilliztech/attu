import { Dispatch, ReactElement, SetStateAction } from 'react';
import { StatusEnum } from '../../components/status/Types';

export interface CollectionView {
  name: string;
  nameElement: ReactElement;
  id: string;
  status: StatusEnum;
  statusElement: ReactElement;
  rowCount: string;
  desc: string;
  indexCreatingElement: ReactElement;
}

export interface CollectionCreateProps {
  handleCreate: (param: CollectionCreateParam) => void;
}

export interface CollectionCreateParam {
  name: string;
  desc: string;
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
  type: DataTypeEnum;
  isPrimaryKey: boolean;
  desc: string;
  dimension?: number | string;
  isDefault?: boolean;
}

export type CreateFieldType = 'primaryKey' | 'vector' | 'number';

export interface CreateFieldsProps {
  fields: Field[];
  setFields: Dispatch<SetStateAction<Field[]>>;
  setfieldsAllValid: Dispatch<SetStateAction<boolean>>;
}
