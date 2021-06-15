import { KeyValuePair } from '../../types/Common';
import { DataTypeEnum } from './Types';

export const VECTOR_FIELDS_OPTIONS: KeyValuePair[] = [
  {
    label: 'Binary Vector',
    value: DataTypeEnum.BinaryVector,
  },
  {
    label: 'Float Vector',
    value: DataTypeEnum.FloatVector,
  },
];

export const ALL_OPTIONS: KeyValuePair[] = [
  ...VECTOR_FIELDS_OPTIONS,
  {
    label: 'Int8',
    value: DataTypeEnum.Int8,
  },
  {
    label: 'Int16',
    value: DataTypeEnum.Int16,
  },
  {
    label: 'Int32',
    value: DataTypeEnum.Int32,
  },
  {
    label: 'Int64',
    value: DataTypeEnum.Int64,
  },
  {
    label: 'Float',
    value: DataTypeEnum.Float,
  },
  {
    label: 'Double',
    value: DataTypeEnum.Double,
  },
];
