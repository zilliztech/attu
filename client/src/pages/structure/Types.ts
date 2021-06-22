import { ReactElement } from 'react';
import { ManageRequestMethods } from '../../types/Common';
import { DataType } from '../collections/Types';

export enum INDEX_TYPES_ENUM {
  IVF_FLAT = 'IVF_FLAT',
  IVF_PQ = 'IVF_PQ',
  IVF_SQ8 = 'IVF_SQ8',
  IVF_SQ8_HYBRID = 'IVF_SQ8_HYBRID',
  FLAT = 'FLAT',
  HNSW = 'HNSW',
  ANNOY = 'ANNOY',
  RNSG = 'RNSG',
}

export interface FieldData {
  _fieldId: string;
  _isPrimaryKey: boolean;
  _fieldName: string;
  _fieldNameElement?: ReactElement;
  _fieldType: DataType;
  _dimension: string;
}

export interface FieldView extends FieldData, IndexView {
  _createIndexDisabled?: boolean;
}

export interface Index {
  params: { key: string; value: string }[];
}

export interface IndexView {
  _fieldName: string;
  _indexType: string;
  _indexTypeElement?: ReactElement;
  _indexParameterPairs: { key: string; value: string }[];
  _indexParamElement?: ReactElement;
}

export type IndexType =
  | 'FLAT'
  | 'IVF_FLAT'
  | 'IVF_SQ8'
  // | 'IVF_SQ8_HYBRID'
  | 'IVF_PQ'
  | 'RNSG'
  | 'HNSW'
  | 'ANNOY';

export interface IndexCreateParam {
  type: ManageRequestMethods;
  collection_name: string;
  field_name: string;
  extra_params: ParamPair[];
}

export interface ParamPair {
  key: string;
  value: string;
}
